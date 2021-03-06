import { Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

import { UpdateDialogService } from '../../dialogs/update-dialog/update-dialog.service';

@Component({
  templateUrl: './interaction-edit-renderer.component.html',
  styleUrls: ['./interaction-edit-renderer.component.scss']
})
export class InteractionEditRendererComponent implements ICellRendererAngularComp {
  showEditButton = false;
  refreshTargetDetails: any;    // The passed target-detail page refresh callback.
  params: ICellRendererParams;

  constructor(private updateDialogService: UpdateDialogService) { }

  refresh(_: any): boolean {
    throw new Error('Method not implemented.');
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.showEditButton = !!this.params.node.data.subunit_one_name;         // Discovering existence. Can edit only an existing interaction.
    this.refreshTargetDetails = this.params.context.refreshTargetDetails;   // Grab the callback for refreshing the page after change.
  }

  afterGuiAttached?(_?: import('@ag-grid-community/all-modules').IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }

  onEditInteraction(): void {
    // Call dialog for editing an interaction.
    this.updateDialogService.openDialogForEditingInteraction(this.params)
      .subscribe((result: string) => {
        // If editing an interaction is successful, refresh the target detail page.
        if (result === 'success') {
          this.refreshTargetDetails();
        }

        // If editing an interaction had been cancelled or had failed, do nothing further here for now.
      });
  }
}
