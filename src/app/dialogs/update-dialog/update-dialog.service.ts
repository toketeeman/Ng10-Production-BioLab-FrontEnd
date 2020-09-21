import { Injectable, TemplateRef } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of } from "rxjs";

import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { IGene } from "../../protein-expression.interface";
import { AddGenesDialogComponent } from './add-genes-dialog/add-genes-dialog.component';
import { AddInteractionDialogComponent } from './add-interaction-dialog/add-interaction-dialog.component';
import { EditInteractionDialogComponent } from './edit-interaction-dialog/edit-interaction-dialog.component';
import { DeleteInteractionDialogComponent } from './delete-interaction-dialog/delete-interaction-dialog.component';
import { AddPtmDialogComponent } from './add-ptm-dialog/add-ptm-dialog.component';
import { EditPtmDialogComponent } from './edit-ptm-dialog/edit-ptm-dialog.component';
import { DeletePtmDialogComponent } from './delete-ptm-dialog/delete-ptm-dialog.component';
import { ErrorDialogService } from "../../dialogs/error-dialog/error-dialog.service";

@Injectable({
  providedIn: 'root'
})
export class UpdateDialogService {

  constructor(
    private dialog: MatDialog,
    private errorDialogService: ErrorDialogService
  ) { }

  openDialogForAddingGenes(subunitName: string, genes: IGene[]): Observable<string> {

    // Configure the adding-genes dialog.
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'standard-modalbox';
    dialogConfig.width = "400px";
    dialogConfig.data = {
     subunitName,
     genes
    };

    return  this.executeDialog(AddGenesDialogComponent, dialogConfig, 'Invalid FASTA DNA file.');
  }

  openDialogForAddingInteraction(params: ICellRendererParams): Observable<string> {

    // Configure the adding-interaction dialog.
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'standard-modalbox';
    dialogConfig.width = "500px";
    dialogConfig.data = {
     params
    };

    return  this.executeDialog(AddInteractionDialogComponent, dialogConfig, 'Invalid interaction data.');
  }

  openDialogForEditingInteraction(params: ICellRendererParams): Observable<string> {

    // Configure the editing-interaction dialog.
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'standard-modalbox';
    dialogConfig.width = "500px";
    dialogConfig.data = {
     params
    };

    return  this.executeDialog(EditInteractionDialogComponent, dialogConfig, 'Invalid interaction data.');
  }

  openDialogForDeletingInteraction(params: ICellRendererParams): Observable<string> {

    // Configure the deleting-interaction dialog.
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'standard-modalbox';
    dialogConfig.width = "400px";
    dialogConfig.data = {
     params
    };

    return  this.executeDialog(DeleteInteractionDialogComponent, dialogConfig, 'Invalid interaction data.');
  }

  openDialogForAddingPtm(params: ICellRendererParams): Observable<string> {

    // Configure the adding-ptm dialog.
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'standard-modalbox';
    dialogConfig.width = "500px";
    dialogConfig.data = {
     params
    };

    return  this.executeDialog(AddPtmDialogComponent, dialogConfig, 'Invalid PTM data.');
  }

  openDialogForEditingPtm(params: ICellRendererParams): Observable<string> {

    // Configure the editing-ptm dialog.
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'standard-modalbox';
    dialogConfig.width = "500px";
    dialogConfig.data = {
     params
    };

    return  this.executeDialog(EditPtmDialogComponent, dialogConfig, 'Invalid PTM data.');
  }

  openDialogForDeletingPtm(params: ICellRendererParams): Observable<string> {

    // Configure the deleting-ptm dialog.
    const dialogConfig = new MatDialogConfig();
    dialogConfig.hasBackdrop = true;
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.panelClass = 'standard-modalbox';
    dialogConfig.width = "400px";
    dialogConfig.data = {
     params
    };

    return  this.executeDialog(DeletePtmDialogComponent, dialogConfig, 'Invalid PTM data.');
  }

  // All future updating dialog invocations (following the general implementation pattern above) will go in here . . .

  // Generic executer wrapper for every dialog.
  executeDialog<T, D = any>(
    componentOrTemplateRef: ComponentType<T> | TemplateRef<T>,
    config: MatDialogConfig<D>,
    defaultBackendErrorMessage: string
  ): Observable<string> {

    // Open the update-specific dialog.
    const dialogRef = this.dialog.open(componentOrTemplateRef, config);

    // Retrieve the result of the dialog as an object that contains only one of the possible properties:
    // 'success', 'error', or 'cancel' (or even more as needed). Show error dialog as needed for the 'error' case.
    // Note: any caller's subscription to this observable will be automatically disposed.
    return dialogRef.afterClosed()
      .pipe(
        map(
          (result => {
            // If the result indicates an update failure, show it now.
            if (result && result.hasOwnProperty('backendError')) {
              const backendError = 'backendError';
              this.errorDialogService.openDialogForErrorResponse(
                result[backendError],
                ['non_field_errors', 'errors'],
                defaultBackendErrorMessage
              );
              return 'backendError';
            }
            if (result && result.hasOwnProperty('error')) {
              const error = 'error';
              this.errorDialogService.openDialogForMessages(result[error]);
              return 'error';
            }
            if (result && result.hasOwnProperty('success')) {
              return 'success';
            }
            if (result && result.hasOwnProperty('cancel')) {
              return 'cancel';
            }
            return '';
          })
        )
      );
  }

}
