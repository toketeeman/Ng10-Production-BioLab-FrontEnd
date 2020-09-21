import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";

import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { environment } from "../../../../environments/environment";
import { ISubunit } from 'src/app/protein-expression.interface';
import { ValidateNumberInput } from "../../../validators/numberInput.validator";

@Component({
  selector: 'app-add-interaction-dialog',
  templateUrl: './add-interaction-dialog.component.html',
  styleUrls: ['./add-interaction-dialog.component.scss']
})
export class AddInteractionDialogComponent implements OnInit {
  params: ICellRendererParams;      // Passed in from the selected interaction row.
  subunits: ISubunit[];             // Passed in from the subunits of current target detail. UI-bound.
  addInteractionForm: FormGroup;    // For generating payload for add-interaction endpoint
  addButtonIsActivated = true;
  interactionsUrl: string;

  get interactionsArray() {
    return this.addInteractionForm.get("interactionsArray") as FormArray;
  }

  constructor(
    private dialogRef: MatDialogRef<AddInteractionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    // Grab the passed-in data. Yes, must be done in the constructor!
    this.params = data.params;
    this.subunits = this.params.context.subunits;

    this.interactionsUrl = environment.urls.interactionsUrl;
  }

  ngOnInit() {
    // Construct the form to manage the adding-interaction request.
    this.addInteractionForm = this.fb.group({
      interactionsArray: this.fb.array([this.createInteractionGroup()])
    });
  }

  createInteractionGroup() {
    return this.fb.group({
      subunit_one: ["", Validators.required],
      subunit_one_copy: new FormControl({ value: '', disabled: true }, [Validators.required, ValidateNumberInput]),
      interaction: ["", Validators.required],
      subunit_two: ["", Validators.required],
      subunit_two_copy: new FormControl({ value: '', disabled: true }, [Validators.required, ValidateNumberInput]),
    });
  }

  updateCopyRange(
    subunitId: string,
    index: number,
    controlName: "subunit_one_copy" | "subunit_two_copy"
  ) {
    const id = parseInt(subunitId, 10);
    const copyNumber = this.subunits.filter(unit => unit.subunit_id === id)[0]
      .copies;

    // Set the maximum range of the appropriate copy number control to the subunit's number of copies.
    const controlsKey = "controls";
    const control = this.interactionsArray.at(index)[controlsKey][controlName];
    control.enable();
    control.setValidators([
      ValidateNumberInput,
      Validators.min(1),
      Validators.max(copyNumber)
    ]);
  }

  // Possible additional validators here.

  onAddInteraction(): void {
    // Issue add-interaction request to endpoint.
    this.http.post<any>(
      this.interactionsUrl,
      this.addInteractionForm.value.interactionsArray
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
