import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

@Component({
  templateUrl: './plasmids-renderer.component.html',
  styleUrls: ['./plasmids-renderer.component.scss']
})
export class PlasmidsRenderer implements ICellRendererAngularComp {
  plasmidCount: number;

  constructor() { }

  refresh(params: any): boolean {
    throw new Error("Method not implemented.");
  }

  agInit(params: ICellRendererParams): void {
    this.plasmidCount = params.value.length;  // the length if an array of plasmid names.
  }

  afterGuiAttached?(params?: import("@ag-grid-community/all-modules").IAfterGuiAttachedParams): void {
    throw new Error("Method not implemented.");
  }
}
