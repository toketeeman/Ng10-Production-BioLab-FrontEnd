import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators
} from "@angular/forms";
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";

import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { environment } from "../../../../environments/environment";
import { ISubunit, ISubunitInteraction } from 'src/app/protein-expression.interface';
import { ValidateNumberInput } from "../../../validators/numberInput.validator";

@Component({
  selector: 'app-edit-interaction-dialog',
  templateUrl: './edit-interaction-dialog.component.html',
  styleUrls: ['./edit-interaction-dialog.component.scss']
})
export class EditInteractionDialogComponent implements OnInit {
  params: ICellRendererParams;    // Passed in for the selected interaction row.
  subunits: ISubunit[];           // Passed in from the subunits of current target detail. UI-bound.
  editInteractionForm: FormGroup; // For generating payload for edit-interaction endpoint
  saveButtonIsActivated = true;
  interactionsUrl: string;
  singleInteractionForm: FormGroup;
  subunitOneId: string;
  subunitTwoId: string;

  get interactionsArray() {
    return this.editInteractionForm.get("interactionsArray") as FormArray;
  }

  constructor(
    private dialogRef: MatDialogRef<EditInteractionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private fb: FormBuilder,
    private http: HttpClient

  ) {
    // Grab the passed-in data. Yes, must be done in the constructor!
    this.params = data.params;
    this.subunits = this.params.context.subunits;

    this.interactionsUrl = environment.urls.interactionsUrl + this.params.node.data.subunit_interaction_id + '/';
  }

  ngOnInit() {
    // Grab the respective subunit ids of the subunits involved in the interaction
    // in order to do immediate activation of complete validation because
    // the data will already be present in the form.
    this.subunitOneId =
      (this.subunits
        .filter(unit => unit.subunit_name === (this.params.node.data as ISubunitInteraction).subunit_one_name)[0].subunit_id)
        .toString();

    this.subunitTwoId =
      (this.subunits
        .filter(unit => unit.subunit_name === (this.params.node.data as ISubunitInteraction).subunit_two_name)[0].subunit_id)
        .toString();

    // Construct the form to manage the edit-interaction request.
    this.editInteractionForm = this.fb.group({
      interactionsArray: this.fb.array([this.createAndPopulateInteractionGroup()])
    });

    // Initialize the validators for the respective current subunits involved in the interaction.
    this.updateCopyRange(this.subunitOneId, 0, this.interactionsArray, 'subunit_one_copy');
    this.updateCopyRange(this.subunitTwoId, 0, this.interactionsArray, 'subunit_two_copy');
  }

  createAndPopulateInteractionGroup(): FormGroup {
    const interactionGroup = this.fb.group({
      subunit_one: ["", Validators.required],
      subunit_one_copy: ["", [Validators.required, ValidateNumberInput]],
      interaction: ["", Validators.required],
      subunit_two: ["", Validators.required],
      subunit_two_copy: ["", [Validators.required, ValidateNumberInput]]
    });

    const nodeData = this.params.node.data;

    interactionGroup.patchValue({
      subunit_one: this.subunitOneId,
      subunit_one_copy: nodeData.subunit_one_copy,
      interaction: nodeData.interaction,
      subunit_two: this.subunitTwoId,
      subunit_two_copy: nodeData.subunit_two_copy
    });

    this.singleInteractionForm = interactionGroup;

    return interactionGroup;
  }

  updateCopyRange(
    subunitId: string,
    index: number,
    controlArray: FormArray,
    controlName: "subunit_one_copy" | "subunit_two_copy"
  ) {
    const id = parseInt(subunitId, 10);
    const copyNumber = this.subunits.filter(unit => unit.subunit_id === id)[0]
      .copies;

    // Set the maximum range of the appropriate copy number control to the subunit's number of copies.
    const controlsKey = "controls";
    const control = controlArray.at(index)[controlsKey][controlName];
    control.setValidators([
      ValidateNumberInput,
      Validators.min(1),
      Validators.max(copyNumber)
    ]);
  }

  // Possible additional validators here.

  onSaveInteraction(): void {
    // Issue edit-interaction request to endpoint.
    this.http.put<any>(
      this.interactionsUrl,
      this.singleInteractionForm.value,
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

  onCancel() {
    this.dialogRef.close({ cancel: true });
  }

}

