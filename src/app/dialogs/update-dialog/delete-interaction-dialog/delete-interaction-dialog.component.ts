import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { of } from "rxjs";

import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { environment } from "../../../../environments/environment";

@Component({
  selector: 'app-delete-interaction-dialog',
  templateUrl: './delete-interaction-dialog.component.html',
  styleUrls: ['./delete-interaction-dialog.component.scss']
})
export class DeleteInteractionDialogComponent implements OnInit {
  params: ICellRendererParams;        // Passed in for the selected interaction row.
  deleteButtonIsActivated = true;
  interactionsUrl: string;

  constructor(
    private dialogRef: MatDialogRef<DeleteInteractionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private http: HttpClient
  ) {
    // Grab the passed-in data. Yes, must be done in the constructor!
    this.params = data.params;

    this.interactionsUrl = environment.urls.interactionsUrl + this.params.node.data.subunit_interaction_id + '/';
   }

  ngOnInit() {
    // No form to construct.
  }

  // Validators should not be needed.

  onDeleteInteraction(): void {
    // Issue delete-interaction request to endpoint upon confirmation.
    this.http.delete<any>(
      this.interactionsUrl,
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
