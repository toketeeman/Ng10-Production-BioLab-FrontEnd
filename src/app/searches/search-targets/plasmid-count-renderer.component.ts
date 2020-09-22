import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

@Component({
  templateUrl: './plasmid-count-renderer.component.html',
  styleUrls: ['./plasmid-count-renderer.component.scss']
})
export class PlasmidCountRendererComponent implements ICellRendererAngularComp {
  plasmidCount: number;

  constructor() { }

  refresh(_: any): boolean {
    throw new Error('Method not implemented.');
  }

  agInit(params: ICellRendererParams): void {
    this.plasmidCount = params.value;  // A plasmid count is a number.
  }

  afterGuiAttached?(_?: import('@ag-grid-community/all-modules').IAfterGuiAttachedParams): void {
    throw new Error('Method not implemented.');
  }
}
