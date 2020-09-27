import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { environment } from '../../../../environments/environment';
import { ISubunit } from 'src/app/protein-expression.interface';
import { ValidateNumberInput } from '../../../validators/numberInput.validator';

@Component({
  templateUrl: './add-ptm-dialog.component.html',
  styleUrls: ['./add-ptm-dialog.component.scss']
})
export class AddPtmDialogComponent implements OnInit {
  params: ICellRendererParams;    // Passed in for the selected ptm row.
  subunits: ISubunit[];           // Passed in from the subunits of current target detail. UI-bound.
  addPtmForm: FormGroup;          // For generating payload for add-ptm endpoint
  addButtonIsActivated = true;
  ptmsUrl: string;

  get ptmsArray(): FormArray {
    return this.addPtmForm.get('ptmsArray') as FormArray;
  }

  constructor(
    private dialogRef: MatDialogRef<AddPtmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Grab the passed-in data. Yes, must be done in the constructor!
    this.params = data.params;
    this.subunits = this.params.context.subunits;

    this.ptmsUrl = environment.urls.ptmsUrl;
  }

  ngOnInit(): void {
    // Construct the form to manage the adding-ptm request.
    this.addPtmForm = this.fb.group({
      ptmsArray: this.fb.array([this.createPtm()])
    });
  }

  createPtm(): FormGroup {
    return this.fb.group({
      subunit_one: ['', Validators.required],
      subunit_one_copy: new FormControl({ value: '', disabled: true }, [Validators.required, ValidateNumberInput]),
      subunit_one_residue: new FormControl({ value: '', disabled: true }, [Validators.required, ValidateNumberInput]),
      subunit_two: ['', Validators.required],
      subunit_two_copy: new FormControl({ value: '', disabled: true }, [Validators.required, ValidateNumberInput]),
      subunit_two_residue: new FormControl({ value: '', disabled: true }, [Validators.required, ValidateNumberInput]),
      ptm: ['', Validators.required]
    });
  }

  updateCopyRange(
    subunitId: string,
    index: number,
    controlArray: FormArray,
    controlName: 'subunit_one_copy' | 'subunit_two_copy'
  ): void {
    const id = parseInt(subunitId, 10);
    const copyNumber = this.subunits.filter(unit => unit.subunit_id === id)[0]
      .copies;

    // Set the maximum range of the appropriate copy number control to the subunit's number of copies.
    const controlsKey = 'controls';
    const control = controlArray.at(index)[controlsKey][controlName] as FormControl;
    control.enable();
    control.setValidators([
      ValidateNumberInput,
      Validators.min(1),
      Validators.max(copyNumber)
    ]);
  }

  updateResidueRange(
    subunitId: string,
    index: number,
    controlArray: FormArray,
    controlName: 'subunit_one_residue' | 'subunit_two_residue'
  ): void {
    const id = parseInt(subunitId, 10);
    const residueLength = this.subunits.filter(
      unit => unit.subunit_id === id
    )[0].amino_acid_sequence.length;

    // Set the maximum range of the appropriate residue number control to the length of the subunit's AA sequence.
    const controlsKey = 'controls';
    const control = controlArray.at(index)[controlsKey][controlName] as FormControl;
    control.enable();
    control.setValidators([
      ValidateNumberInput,
      Validators.min(1),
      Validators.max(residueLength)
    ]);
  }

  updateCopyAndResidueRanges(
    subunitId: string,
    index: number,
    controlArray: FormArray,
    copyControlName: 'subunit_one_copy' | 'subunit_two_copy',
    residueControlName: 'subunit_one_residue' | 'subunit_two_residue'
  ): void {
    this.updateCopyRange(subunitId, index, controlArray, copyControlName);
    this.updateResidueRange(subunitId, index, controlArray, residueControlName);
  }

  // Possible additional validators here.

  onAddPtm(): void {
    // Issue add-interaction request to endpoint.
    this.http.post<any>(
      this.ptmsUrl,
      this.addPtmForm.value.ptmsArray
    )
    .pipe(
      tap( ( _: any) => {
        this.dialogRef.close({ success: true });
      }),
      catchError( (error: any) => {
        this.dialogRef.close({ backendError: error });
        return of(null);
      })
    )
    .subscribe();

    this.dialogRef.close({ success: true });
  }

  onCancel(): void {
    this.dialogRef.close({ cancel: true });
  }

}
