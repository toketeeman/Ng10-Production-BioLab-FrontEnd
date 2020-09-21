import { Component } from '@angular/core';
import { ICellRendererAngularComp } from "@ag-grid-community/angular";
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';

@Component({
  templateUrl: './feature-qualifier-renderer.component.html',
  styleUrls: ['./feature-qualifier-renderer.component.scss']
})
export class FeatureQualifierRenderer implements ICellRendererAngularComp {
  featureQualifier: any[];

  constructor() { }

  refresh(params: any): boolean {
    throw new Error("Method not implemented.");
  }

  agInit(params: ICellRendererParams): void {
    this.featureQualifier = params.value;  // A feature qualifier is an array of qualifiers.
  }

  afterGuiAttached?(params?: import("@ag-grid-community/all-modules").IAfterGuiAttachedParams): void {
    throw new Error("Method not implemented.");
  }
}
