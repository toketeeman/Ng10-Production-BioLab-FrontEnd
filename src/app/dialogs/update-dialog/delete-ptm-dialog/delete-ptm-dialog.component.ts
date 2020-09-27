import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { environment } from '../../../../environments/environment';

@Component({
  templateUrl: './delete-ptm-dialog.component.html',
  styleUrls: ['./delete-ptm-dialog.component.scss']
})
export class DeletePtmDialogComponent implements OnInit {
  params: ICellRendererParams;    // Passed in for the selected ptm row.
  deleteButtonIsActivated = true;
  ptmsUrl: string;

  constructor(
    private dialogRef: MatDialogRef<DeletePtmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data,
    private http: HttpClient
  ) {
    // Grab the passed-in data. Yes, must be done in the constructor!
    this.params = data.params;

    this.ptmsUrl = environment.urls.ptmsUrl + this.params.node.data.subunit_ptm_id + '/';
  }

  ngOnInit(): void {
    // No form to construct.

  }

  // Validators should not be needed.

  onDeletePtm(): void {
    // Issue delete-ptm request to endpoint.
    this.http.delete<any>(
      this.ptmsUrl,
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
