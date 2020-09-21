import { Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { UpdateDialogService } from '../../dialogs/update-dialog/update-dialog.service';

@Component({
  templateUrl: './ptm-edit-renderer.component.html',
  styleUrls: ['./ptm-edit-renderer.component.scss']
})
export class PtmEditRenderer implements ICellRendererAngularComp {
  showEditButton = false;
  refreshTargetDetails: any;
  params: ICellRendererParams;

  constructor(private updateDialogService: UpdateDialogService) { }

  refresh(params: any): boolean {
    throw new Error('Method not implemented.');
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.showEditButton = !!this.params.node.data.subunit_one_name;         // Discovering existence. Can edit only an existing ptm.
    this.refreshTargetDetails = this.params.context.refreshTargetDetails;   // Grab the callback for refreshing the page after change.
  }

  afterGuiAttached?(params?: import('@ag-grid-community/all-modules').IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }

  onEditPtm(): void {
    // Call dialog for editing a ptm.
    this.updateDialogService.openDialogForEditingPtm(this.params)
      .subscribe((result: string) => {
        // If editing a ptm is successful, refresh the target detail page.
        if (result === 'success') {
          this.refreshTargetDetails();
        }

        // If editing a ptm had been cancelled or had failed, do nothing further here for now.
      });
  }
}

