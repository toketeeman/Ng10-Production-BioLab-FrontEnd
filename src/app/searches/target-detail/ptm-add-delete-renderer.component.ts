import { Component } from '@angular/core';

import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { UpdateDialogService } from '../../dialogs/update-dialog/update-dialog.service';
import { ISubunit } from "../../protein-expression.interface";

@Component({
  templateUrl: './ptm-add-delete-renderer.component.html',
  styleUrls: ['./ptm-add-delete-renderer.component.scss']
})
export class PtmAddDeleteRenderer implements ICellRendererAngularComp {
  showAddButton = false;
  showDeleteButton = false;
  refreshTargetDetails: any;
  params: ICellRendererParams;

  constructor(private updateDialogService: UpdateDialogService) { }

  refresh(params: any): boolean {
    throw new Error("Method not implemented.");
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.showDeleteButton = !!this.params.node.data.subunit_one_name;     // Discovering existence. Can delete only an existing ptm.
    this.showAddButton = !this.showDeleteButton;                          // Can add ptm if one did not exist.
    this.refreshTargetDetails = this.params.context.refreshTargetDetails; // Grab the callback for refreshing the page after change.
  }

  afterGuiAttached?(params?: import("@ag-grid-community/all-modules").IAfterGuiAttachedParams): void {
    throw new Error("Method not implemented.");
  }

  onAddPtm() {
    // Call dialog for adding a ptm.
    this.updateDialogService.openDialogForAddingPtm(this.params)
      .subscribe((result: string) => {
        // If adding a ptm is successful, refresh the target detail page.
        if (result === 'success') {
          this.refreshTargetDetails();
        }

        // If adding a ptm had been cancelled or had failed, do nothing further here for now.
      });
  }

  onDeletePtm() {
    // Call dialog for deleting a ptm.
    this.updateDialogService.openDialogForDeletingPtm(this.params)
    .subscribe((result: string) => {
      // If deleting a ptm is successful, refresh the target detail page.
      if (result === 'success') {
        this.refreshTargetDetails();
      }

      // If deleting a ptm had been cancelled or had failed, do nothing further here for now.
    });
  }

}
