import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormControl
} from '@angular/forms';
import { forkJoin, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import {
  ITargetDetail,
  ISubunit,
  ISubunitInteraction,
  IPostTranslationalModification
} from '../protein-expression.interface';
import { ValidateNumberInput } from '../validators/numberInput.validator';
import { PTMBonding } from '../validators/ptmBonding.validator';
import { AlertService } from '../services/alert.service';
import { ErrorDialogService } from '../dialogs/error-dialog/error-dialog.service';
import { TargetRegistrationService } from '../services/target-registration.service';
import { TargetDetailStoreService } from '../services/target-detail-store.service';

@Component({
  templateUrl: './subunit-interactions.component.html',
  styleUrls: ['./subunit-interactions.component.scss']
})
export class SubunitInteractionsComponent implements OnInit {
  interactionForm: FormGroup;
  target: string;
  subunits: ISubunit[];
  disableDeactivateGuard = false;

  // Getters allow the subunit interactions form template to refer to dynamic formArrays by variable name.
  get subunitsArray(): FormArray {
    return this.interactionForm.get('subunitsArray') as FormArray;
  }
  get ptmsArray(): FormArray {
    return this.interactionForm.get('ptmsArray') as FormArray;
  }

  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    private errorDialogService: ErrorDialogService,
    private targetRegistrationService: TargetRegistrationService,
    private targetDetailStoreService: TargetDetailStoreService
  ) {}

  ngOnInit(): void {
    this.targetDetailStoreService.retrieveTargetDetailStore()
      .subscribe( (targetDetail: ITargetDetail) => {
        this.subunits = targetDetail.target.subunits;
        this.target = targetDetail.target.target_name;

        this.interactionForm = this.fb.group({
          subunitsArray: this.fb.array([this.createSubUnitInteraction()]),
          ptmsArray: this.fb.array([this.createPtm()])
        });
      });
  }

  createSubUnitInteraction(): FormGroup {
    return this.fb.group({
      subunit_one: ['', Validators.required],
      subunit_one_copy: new FormControl({ value: '', disabled: true }, [Validators.required, ValidateNumberInput]),
      interaction: ['', Validators.required],
      subunit_two: ['', Validators.required],
      subunit_two_copy: new FormControl({ value: '', disabled: true }, [Validators.required, ValidateNumberInput]),
    });
  }

  createPtm(): FormGroup {
    const ptmFormGroup =
      this.fb.group({
        subunit_one: ['', Validators.required],
        subunit_one_copy: new FormControl({ value: '', disabled: true }),     // Validators injected later.
        subunit_one_residue: new FormControl({ value: '', disabled: true }),  // Validators injected later.
        subunit_two: ['', Validators.required],
        subunit_two_copy: new FormControl({ value: '', disabled: true }),     // Validators injected later.
        subunit_two_residue: new FormControl({ value: '', disabled: true }),  // Validators injected later.
        ptm: ['', Validators.required]
      });
    ptmFormGroup.setValidators(
      PTMBonding(
        this.subunits,
        'subunit_one',
        'subunit_one_copy',
        'subunit_one_residue',
        'subunit_two',
        'subunit_two_copy',
        'subunit_two_residue',
        'ptm'));
    return ptmFormGroup;
  }

  addSubUnitInteraction(): void {
    // Adds new instance of subunitInteraction formGroup to subunitInteractions formArray.
    this.subunitsArray.push(this.createSubUnitInteraction());
  }

  addPtm(): void {
    // Adds new instance of ptm formGroup to ptms formArray.
    this.ptmsArray.push(this.createPtm());
  }

  updateCopyRange(
    subunitId: string,
    controlGroup: FormGroup,
    controlName: 'subunit_one_copy' | 'subunit_two_copy'
  ): void {
    const id = parseInt(subunitId, 10);
    const copyNumber = this.subunits.filter(unit => unit.subunit_id === id)[0]
      .copies;

    // Set the maximum range of the appropriate copy number control to the subunit's number of copies.
    const controlsKey = 'controls';
    const control = controlGroup[controlsKey][controlName] as FormControl;
    control.enable();
    control.setValidators([
      Validators.required,
      ValidateNumberInput,
      Validators.min(1),
      Validators.max(copyNumber)
    ]);
  }

  updateResidueRange(
    subunitId: string,
    controlGroup: FormGroup,
    controlName: 'subunit_one_residue' | 'subunit_two_residue'
  ): void {
    const id = parseInt(subunitId, 10);
    const residueLength = this.subunits.filter(
      unit => unit.subunit_id === id
    )[0].amino_acid_sequence.length;

    // Set the maximum range of the appropriate residue number control to the length of the subunit's AA sequence.
    const controlsKey = 'controls';
    const control = controlGroup[controlsKey][controlName] as FormControl;
    control.enable();
    control.setValidators([
      Validators.required,
      ValidateNumberInput,
      Validators.min(1),
      Validators.max(residueLength)
    ]);
  }

  updateCopyAndResidueRanges(
    subunitId: string,
    controlGroup: FormGroup,
    copyControlName: 'subunit_one_copy' | 'subunit_two_copy',
    residueControlName: 'subunit_one_residue' | 'subunit_two_residue'
  ): void {
    this.updateCopyRange(subunitId, controlGroup, copyControlName);
    this.updateResidueRange(subunitId, controlGroup, residueControlName);
  }

  deleteInteraction(arrayName: 'subunitsArray' | 'ptmsArray', index: number): void {
    // Removes instance of formGroup at specified index from specified formArray.
    this[arrayName].removeAt(index);
  }

  SubunitIDToName(id: any): string {
    return this.subunits.find((subunit) => id.toString() === subunit.subunit_id.toString()).subunit_name;
  }

  onSubmit(): void {

    this.disableDeactivateGuard = true;

    forkJoin([
      this.targetRegistrationService.registerInteractions(this.interactionForm.value.subunitsArray)
        .pipe(
          catchError(_ => {
            const noResults: any[] = [];
            return of(noResults);
          })
        ),
      this.targetRegistrationService.registerPtms(this.interactionForm.value.ptmsArray)
        .pipe(
          catchError(_ => {
            const noResults: any[] = [];
            return of(noResults);
          })
        ),
    ])
      .pipe(
        tap(([interactionsResponseData, ptmsResponseData]) => {
          // Check for failures.

          // Previously, entering 0 interactions or 0 PTMs constituted a failure:
          // const interactionsFailed = (interactionsResponseData as any[]).length === 0;
          // const ptmsFailed = (ptmsResponseData as any[]).length === 0;

          // This shouldn't be considered a failure, but leaving the structure in
          // case another failure is considered that isn't already caught by the front end
          const interactionsFailed = false;
          const ptmsFailed = false;

          if ( interactionsFailed || ptmsFailed) {
            if ( interactionsFailed !== ptmsFailed) {
              if ( interactionsFailed ) {
                // TODO: Undo the ptms registration here.

                // Report the interactions failure.
                this.errorDialogService.openDialogForMessages(
                  'The interaction(s) cannot be registered. So your ptm(s) and target registrations will be cancelled.'
                );
              } else {
                // TODO: Undo the interactions registration here.

                // Report the ptms failure.
                this.errorDialogService.openDialogForMessages(
                  'The PTMs cannot be registered. So your interaction(s) and target registrations will be cancelled.'
                );
              }
            } else {
              // Report the mutual interactions and ptms failures.
              this.errorDialogService.openDialogForMessages(
                'Both the interaction(s) and the PTM(s) cannot be registered. So your target registration will be cancelled.'
              );
            }
            // TODO: Undo parent target registration here.

          } else {
            // Successful registrations for both interactions and ptms.

            // Move from back-end format to UI format.
            const subunitInteractionsUpdate: ISubunitInteraction[] = [];
            for ( const interactionResponse of interactionsResponseData as any[] ) {
              const interactionUpdate: ISubunitInteraction = {
                subunit_one_name: this.SubunitIDToName(interactionResponse.subunit_one),
                subunit_one_copy: interactionResponse.subunit_one_copy,
                subunit_two_name: this.SubunitIDToName(interactionResponse.subunit_two),
                subunit_two_copy: interactionResponse.subunit_two_copy,
                interaction: interactionResponse.interaction
              };
              subunitInteractionsUpdate.push(interactionUpdate);
            }

            // Move from back-end format to UI format.
            const ptmsUpdate: IPostTranslationalModification[] = [];
            for ( const ptmResponse of ptmsResponseData as any[] ) {
              const ptmUpdate: IPostTranslationalModification = {
                subunit_one_name: this.SubunitIDToName(ptmResponse.subunit_one),
                subunit_one_copy: ptmResponse.subunit_one_copy,
                subunit_one_residue: ptmResponse.subunit_one_residue,
                subunit_two_name: this.SubunitIDToName(ptmResponse.subunit_two),
                subunit_two_copy: ptmResponse.subunit_two_copy,
                subunit_two_residue: ptmResponse.subunit_two_residue,
                ptm: ptmResponse.ptm
              };
              ptmsUpdate.push(ptmUpdate);
            }

            this.targetDetailStoreService.storeTargetDetailInteractionsAndPtms(
              subunitInteractionsUpdate,
              ptmsUpdate,
              '/home/success');
          }
        })
      )
      .subscribe();
  }

  onReset(): void {
    this.interactionForm.reset();
    this.interactionForm.markAsPristine();
    this.interactionForm.markAsUntouched();

    const controlsKey = 'controls';
    const subunitOneCopy = 'subunit_one_copy';
    const subunitTwoCopy = 'subunit_two_copy';
    for ( const interaction of this.subunitsArray[controlsKey]) {
      (interaction[controlsKey][subunitOneCopy] as FormControl).disable();
      (interaction[controlsKey][subunitTwoCopy] as FormControl).disable();
    }
    const subunitOneResidue = 'subunit_one_residue';
    const subunitTwoResidue = 'subunit_two_residue';
    for ( const ptm of this.ptmsArray[controlsKey]) {
      (ptm[controlsKey][subunitOneCopy] as FormControl).disable();
      (ptm[controlsKey][subunitTwoCopy] as FormControl).disable();
      (ptm[controlsKey][subunitOneResidue] as FormControl).disable();
      (ptm[controlsKey][subunitTwoResidue] as FormControl).disable();
    }
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    // TODO: Need logic here to handle option to cancel the parent target registration!

    if (this.interactionForm.untouched || this.disableDeactivateGuard) {
      return true;
    }
    return this.alertService.confirmDeactivation('Discard changes?');
  }

}
