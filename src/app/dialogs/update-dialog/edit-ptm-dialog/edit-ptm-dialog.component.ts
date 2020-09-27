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
import { ISubunit, IPostTranslationalModification } from 'src/app/protein-expression.interface';
import { ValidateNumberInput } from '../../../validators/numberInput.validator';

@Component({
  templateUrl: './edit-ptm-dialog.component.html',
  styleUrls: ['./edit-ptm-dialog.component.scss']
})
export class EditPtmDialogComponent implements OnInit {
  params: ICellRendererParams;    // Passed in for the selected ptm row.
  subunits: ISubunit[];           // Passed in from the subunits of current target detail. UI-bound.
  editPtmForm: FormGroup;         // For generating payload for edit-ptm endpoint
  saveButtonIsActivated = true;
  ptmsUrl: string;
  singlePtmForm: FormGroup;
  subunitOneId: string;
  subunitTwoId: string;

  get ptmsArray(): FormArray {
    return this.editPtmForm.get('ptmsArray') as FormArray;
  }

  constructor(
    private dialogRef: MatDialogRef<EditPtmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Grab the passed-in data. Yes, must be done in the constructor!
    this.params = data.params;
    this.subunits = this.params.context.subunits;

    this.ptmsUrl = environment.urls.ptmsUrl + this.params.node.data.subunit_ptm_id + '/';
  }

  ngOnInit(): void {
    // Grab the respective subunit ids of the subunits involved in the PTM
    // in order to do immediate activation of complete validation because
    // the data will already be present in the form.
    this.subunitOneId =
      (this.subunits
        .filter(unit => unit.subunit_name === (this.params.node.data as IPostTranslationalModification).subunit_one_name)[0].subunit_id)
        .toString();

    this.subunitTwoId =
      (this.subunits
        .filter(unit => unit.subunit_name === (this.params.node.data as IPostTranslationalModification).subunit_two_name)[0].subunit_id)
        .toString();

    // Construct the form to manage the edit-ptm request.
    this.editPtmForm = this.fb.group({
      ptmsArray: this.fb.array([this.createAndPopulatePtmGroup()])
    });

    // Initialize the validators for the respective current subunits involved in the PTM.
    this.updateCopyAndResidueRanges(this.subunitOneId, 0, this.ptmsArray, 'subunit_one_copy', 'subunit_one_residue');
    this.updateCopyAndResidueRanges(this.subunitTwoId, 0, this.ptmsArray, 'subunit_two_copy', 'subunit_two_residue');
  }

  createAndPopulatePtmGroup(): FormGroup {
    const ptmGroup = this.fb.group({
      subunit_one: ['', Validators.required],
      subunit_one_copy: ['', [Validators.required, ValidateNumberInput]],
      subunit_one_residue: ['', [Validators.required, ValidateNumberInput]],
      subunit_two: ['', Validators.required],
      subunit_two_copy: ['', [Validators.required, ValidateNumberInput]],
      subunit_two_residue: ['', [Validators.required, ValidateNumberInput]],
      ptm: ['', Validators.required]
    });

    const nodeData = this.params.node.data;

    ptmGroup.patchValue({
      subunit_one: this.subunitOneId,
      subunit_one_copy: nodeData.subunit_one_copy,
      subunit_one_residue: nodeData.subunit_one_residue,
      subunit_two: this.subunitTwoId,
      subunit_two_copy: nodeData.subunit_two_copy,
      subunit_two_residue: nodeData.subunit_two_residue,
      ptm: nodeData.ptm,
    });

    this.singlePtmForm = ptmGroup;

    return ptmGroup;
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

  onSavePtm(): void {
    // Issue edit-interaction request to endpoint.
    this.http.put<any>(
      this.ptmsUrl,
      this.singlePtmForm.value,
      {}
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
  }

  onCancel(): void {
    this.dialogRef.close({ cancel: true });
  }

}
