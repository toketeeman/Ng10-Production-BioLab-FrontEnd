import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss'],
})
export class ErrorDialogComponent implements OnInit {

  errorMessages: string[];

  constructor(
    private dialogRef: MatDialogRef<ErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
      this.errorMessages = data.errorMessages;
    }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }

}
