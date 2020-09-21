import { Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { UpdateDialogService } from '../../dialogs/update-dialog/update-dialog.service';

@Component({
  templateUrl: './interaction-add-delete-renderer.component.html',
  styleUrls: ['./interaction-add-delete-renderer.component.scss']
})
export class InteractionAddDeleteRenderer implements ICellRendererAngularComp {
  showAddButton = false;
  showDeleteButton = false;
  refreshTargetDetails: any;  // The passed target-detail page refresh callback.
  params: ICellRendererParams;

  constructor(private updateDialogService: UpdateDialogService) { }

  refresh(params: any): boolean {
    throw new Error('Method not implemented.');
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.showDeleteButton = !!this.params.node.data.subunit_one_name;     // Discovering existence. Can delete only an existing interaction.
    this.showAddButton = !this.showDeleteButton;                          // Can add interaction if one did not exist.
    this.refreshTargetDetails = this.params.context.refreshTargetDetails; // Grab callback for refreshing target-details page after change.
  }

  afterGuiAttached?(params?: import('@ag-grid-community/all-modules').IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }

  onAddInteraction() {
    // Call dialog for adding an interaction.
    this.updateDialogService.openDialogForAddingInteraction(this.params)
      .subscribe((result: string) => {
        // If adding an interaction is successful, refresh the target detail page.
        if (result === 'success') {
          this.refreshTargetDetails();
        }

        // If adding an interaction had been cancelled or had failed, do nothing further here for now.
      });
  }

  onDeleteInteraction() {
    // Call dialog for deleting an interaction.
    this.updateDialogService.openDialogForDeletingInteraction(this.params)
      .subscribe((result: string) => {
        // If deleting an interaction is successful, refresh the target detail page.
        if (result === 'success') {
          this.refreshTargetDetails();
        }

        // If deleting an interaction had been cancelled or had failed, do nothing further here for now.
      });
  }

}
