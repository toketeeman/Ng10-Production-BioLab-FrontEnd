import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { AgGridAngular } from '@ag-grid-community/angular';
import { AllModules, Module } from '@ag-grid-enterprise/all-modules';

import { ISequenceProperties, IGridBioProperty } from '../../protein-expression.interface';
import { ToolsSequencePropertyStoreService } from '../../services/tools-sequence-property-store.service';


@Component({
  templateUrl: './sequence-properties.component.html',
  styleUrls: ['./sequence-properties.component.scss']
})
export class SequencePropertiesComponent implements OnInit, AfterViewInit {
  @ViewChild('sequencePropertyGrid', { static: false }) sequencePropertyGrid: AgGridAngular;

  AASequence: string;
  propertyListGridData: IGridBioProperty[];
  public modules: Module[] = AllModules;
  public domLayout;
  propertyColumnDefs;

  constructor(
    private router: Router,
    private toolsSequencePropertyStoreService: ToolsSequencePropertyStoreService
  ) {}

  ngOnInit(): void {
    this.domLayout = 'autoHeight';

    this.propertyColumnDefs = [
      {
        headerName: 'Property',
        headerClass: 'target-property-header',
        field: 'name',
        autoHeight: true,
        width: 400,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: 'Value',
        headerClass: 'target-property-header',
        field: 'value',
        autoHeight: true,
        width: 120,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: 'Unit',
        headerClass: 'target-property-header',
        field: 'unit',
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word'
        },
        sortable: false,
        menuTabs: []
      }
    ];

    const currentSequencePropertyState: any =  this.toolsSequencePropertyStoreService.retrieveToolsSequencePropertyState();
    const sequenceProperties = (currentSequencePropertyState.returnedSequenceProperties as ISequenceProperties);
    this.AASequence = sequenceProperties.amino_acid_sequence;

    const gridPropertyList: IGridBioProperty[] = [];
    gridPropertyList.push({ name: 'Average Molecular Weight (Oxidized)',
                            value: sequenceProperties.avg_molecular_weight_ox,
                            unit: 'Da'});
    gridPropertyList.push({ name: 'Average Molecular Weight (Reduced)',
                            value: sequenceProperties.avg_molecular_weight_red,
                            unit: 'Da'});
    gridPropertyList.push({ name: 'Monoisotopic Molecular Weight (Oxidized)',
                            value: sequenceProperties.monoisotopic_weight_ox,
                            unit: 'Da'});
    gridPropertyList.push({ name: 'Monoisotopic Molecular Weight (Reduced)',
                            value: sequenceProperties.monoisotopic_weight_red,
                            unit: 'Da'});
    gridPropertyList.push({ name: 'Isoelectric Point',
                            value: sequenceProperties.isoelectric_point,
                            unit: 'pH'});
    gridPropertyList.push({ name: 'Average Hydropathy (Gravy)',
                            value: sequenceProperties.gravy,
                            unit: 'Average hydropathy (Kyte-Doolittle)'});
    gridPropertyList.push({ name: 'Aromaticity',
                            value: sequenceProperties.aromaticity,
                            unit: 'Relative % of Phe+Trp+Tyr'});
    gridPropertyList.push({ name: 'Mass Extinction Coefficient @ 280nm (Oxidized)',
                            value: sequenceProperties.e280_mass_ox,
                            unit: 'm^2 kg^(-1)'});
    gridPropertyList.push({ name: 'Mass Extinction Coefficient @ 280nm (Reduced)',
                            value: sequenceProperties.e280_mass_red,
                            unit: 'm^2 kg^(-1)'});
    gridPropertyList.push({ name: 'Mass Extinction Coefficient @ 214nm',
                            value: sequenceProperties.e214_mass,
                            unit: 'm^2 kg^(-1)'});
    gridPropertyList.push({ name: 'Molar Extinction Coefficient @ 280nm (Oxidized)',
                            value: sequenceProperties.e280_molar_ox,
                            unit: 'M^(-1) cm^(-1)'});
    gridPropertyList.push({ name: 'Molar Extinction Coefficient @ 280nm (Reduced)',
                            value: sequenceProperties.e280_molar_red,
                            unit: 'M^(-1) cm^(-1)'});
    gridPropertyList.push({ name: 'Molar Extinction Coefficient @ 214nm',
                            value: sequenceProperties.e214_molar,
                            unit: 'M^(-1) cm^(-1)'});
    gridPropertyList.push({ name: null,     // Work-around to avoid ag-Grid's flickering/obscuring the last data row.
                            value: null,
                            unit: null});
    this.propertyListGridData = gridPropertyList;

  }

  ngAfterViewInit(): void {
    // Responsive window behavior, with debouncing.
    this.sequencePropertyGrid.api.sizeColumnsToFit();
    let timeout;
    window.onresize = () => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(
        () => {
          this.sequencePropertyGrid.api.sizeColumnsToFit();
        }
      );
    };
  }

  onBackToTools(): void {
    this.router.navigateByUrl('/home/tools/back-from-sequence-property');
  }

}
