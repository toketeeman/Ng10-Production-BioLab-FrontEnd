import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AgGridAngular } from '@ag-grid-community/angular';
import { AllModules, Module } from '@ag-grid-enterprise/all-modules';

import { ITargetProperties, ITargetPropertyList, IGridBioProperty, ISubunit } from '../../protein-expression.interface';
import { environment } from '../../../environments/environment';
import { ErrorDialogService } from '../../dialogs/error-dialog/error-dialog.service';
import { TargetPropertyStoreService } from '../../services/target-property-store.service';
import { ValidateNumberInput } from '../../validators/numberInput.validator';

@Component({
  templateUrl: './target-property.component.html',
  styleUrls: ['./target-property.component.scss']
})
export class TargetPropertyComponent implements OnInit, AfterViewInit {
  @ViewChild('targetPropertyGrid', { static: false }) targetPropertyGrid: AgGridAngular;

  fullProteinProperties: ITargetPropertyList;
  targetName: string;
  subunits: ISubunit[];
  subunitForm: FormGroup;
  isEntry = true;
  currentTargetId: string;
  targetsPropertyUrl: string;
  propertyListGridData$: Observable<IGridBioProperty[]>;
  public modules: Module[] = AllModules;
  public domLayout;
  propertyColumnDefs;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient,
    private errorDialogService: ErrorDialogService,
    private targetPropertyStoreService: TargetPropertyStoreService
  ) { }

  ngOnInit(): void {
    this.currentTargetId = this.route.snapshot.paramMap.get('id');

    if (environment.inMemoryData) {
      this.targetsPropertyUrl = environment.urls.targetsPropertyUrl;
    } else {
      this.targetsPropertyUrl = environment.urls.targetsPropertyUrl + '?target_id=' + this.currentTargetId;
    }

    // Get current target name and subunits from the target property store service.
    const propertyStoreState = this.targetPropertyStoreService.retrieveTargetPropertyState();
    this.targetName = propertyStoreState.target_name;
    this.subunits = propertyStoreState.subunits;

    // Use it to generate and pre-populate the reactive form for the subunit copy # controls.
    this.subunitForm = this.fb.group({});
    for (const subunit of this.subunits) {
      this.subunitForm.addControl(
        subunit.subunit_name,
        new FormControl(
          subunit.copies.toString(),
          [Validators.required, ValidateNumberInput, Validators.min(0), Validators.max(subunit.copies)])
      );
    }

    console.log('XXX subunitForm: ', JSON.stringify(this.subunitForm.value));

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
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold',
          width: '20%'
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
          'overflow-wrap': 'break-word',
          width: '25%'
        },
        sortable: false,
        menuTabs: []
      }
    ];

    this.http.post<any>(this.targetsPropertyUrl, null)
      .pipe(
        tap((response: ITargetProperties) => {
          // Initial population of properties for entire protein molecule here.
          this.PopulateProperties(response.protein);
          this.fullProteinProperties = response.protein;
        }),
        catchError(error => {
          this.errorDialogService.openDialogForErrorResponse(
            error,
            ['message'],
            'Biophysical properties for this target could not be found.'
          );
          const noResult: ITargetProperties = null;
          return of(noResult);
        })
      ).subscribe();

    // const response = {
    //   protein: {
    //     name: 'Heavy Fat Protein',
    //     avg_molecular_weight_ox: '83469.9230',
    //     monoisotopic_weight_ox: '83502.4876',
    //     avg_molecular_weight_red: '7.2296',
    //     monoisotopic_weight_red: '8.1096',
    //     isoelectric_point: '-0.21',
    //     gravy: '-8.500',
    //     aromaticity: '-9.9',
    //     e280_mass_ox: '60390',
    //     e280_mass_red: '83456',
    //     e214_mass: '4355',
    //     e280_molar_ox: '6732',
    //     e280_molar_red: '43722',
    //     e214_molar: '824289'
    //   }
    // };

    // this.PopulateProperties(response.protein);
    // this.fullProteinProperties = response.protein;

  }

  ngAfterViewInit(): void {
    // Change the property value column header to indicate full protein properties.
    const columnDef = this.targetPropertyGrid.api.getColumnDef('name');
    columnDef.headerName = 'Property (All Subunits)';

    // Responsive window behavior, with debouncing.
    this.targetPropertyGrid.api.sizeColumnsToFit();
    let timeout;
    window.onresize = () => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(
        () => {
          this.targetPropertyGrid.api.sizeColumnsToFit();
        }
      );
    };
  }

  PopulateProperties(propertyList: ITargetPropertyList): void {
    const gridPropertyList: IGridBioProperty[] = [];
    gridPropertyList.push({ name: 'Average Molecular Weight (Oxidized)',
                            value: propertyList.avg_molecular_weight_ox,
                            unit: 'Da'});
    gridPropertyList.push({ name: 'Average Molecular Weight (Reduced)',
                            value: propertyList.avg_molecular_weight_red,
                            unit: 'Da'});
    gridPropertyList.push({ name: 'Monoisotopic Molecular Weight (Oxidized)',
                            value: propertyList.monoisotopic_weight_ox,
                            unit: 'Da'});
    gridPropertyList.push({ name: 'Monoisotopic Molecular Weight (Reduced)',
                            value: propertyList.monoisotopic_weight_red,
                            unit: 'Da'});
    gridPropertyList.push({ name: 'Isoelectric Point',
                            value: propertyList.isoelectric_point,
                            unit: 'pH'});
    gridPropertyList.push({ name: 'Average Hydropathy (Gravy)',
                            value: propertyList.gravy,
                            unit: 'Average hydropathy (Kyte-Doolittle)'});
    gridPropertyList.push({ name: 'Aromaticity',
                            value: propertyList.aromaticity,
                            unit: 'Relative % of Phe+Trp+Tyr'});
    gridPropertyList.push({ name: 'Mass Extinction Coefficient @ 280nm (Oxidized)',
                            value: propertyList.e280_mass_ox,
                            unit: 'm^2 kg^(-1)'});
    gridPropertyList.push({ name: 'Mass Extinction Coefficient @ 280nm (Reduced)',
                            value: propertyList.e280_mass_red,
                            unit: 'm^2 kg^(-1)'});
    gridPropertyList.push({ name: 'Mass Extinction Coefficient @ 214nm',
                            value: propertyList.e214_mass,
                            unit: 'm^2 kg^(-1)'});
    gridPropertyList.push({ name: 'Molar Extinction Coefficient @ 280nm (Oxidized)',
                            value: propertyList.e280_molar_ox,
                            unit: 'M^(-1) cm^(-1)'});
    gridPropertyList.push({ name: 'Molar Extinction Coefficient @ 280nm (Reduced)',
                            value: propertyList.e280_molar_red,
                            unit: 'M^(-1) cm^(-1)'});
    gridPropertyList.push({ name: 'Molar Extinction Coefficient @ 214nm',
                            value: propertyList.e214_molar,
                            unit: 'M^(-1) cm^(-1)'});
    gridPropertyList.push({ name: null,     // Work-around to avoid ag-Grid's flickering/obscuring the last data row.
                            value: null,
                            unit: null});

    this.propertyListGridData$ = of(gridPropertyList);
  }

  onUpdate(): void {
    // Grab the form value and generate the payload for retrieving the properties.
    const subunitNames = Object.keys(this.subunitForm.value);
    const propertiesRequestBody: any = [];
    for ( const subunitName of subunitNames ) {
      propertiesRequestBody.push({
        subunit_name: subunitName,
        copies: this.subunitForm.value[subunitName]
      });
    }

    console.log('XXX propertiesRequestBody: ', JSON.stringify(propertiesRequestBody));

    // Change column header here to indicate selection mode.
    const columnDef = this.targetPropertyGrid.api.getColumnDef('name');
    columnDef.headerName = 'Property (SELECTED Subunits)';
    this.targetPropertyGrid.api.refreshHeader();

    // Retrieve the properties from backend.
    this.http.post<any>(
      this.targetsPropertyUrl,
      propertiesRequestBody
    )
      .pipe(
        tap((response: any) => {
          // Re-population of properties for entire protein molecule here.
          this.PopulateProperties(response.protein);
        }),
        catchError(error => {
          this.errorDialogService.openDialogForErrorResponse(
            error,
            ['message'],
            'Biophysical properties for this target could not be found.'
          );
          const noResult: ITargetProperties = null;
          return of(noResult);
        })
      ).subscribe();

    // const response = {
    //   protein: {
    //     name: 'ABC-123',
    //     avg_molecular_weight_ox: '13469.9230',
    //     monoisotopic_weight_ox: '13502.4876',
    //     avg_molecular_weight_red: '7.2296',
    //     monoisotopic_weight_red: '6.1096',
    //     isoelectric_point: '-0.21',
    //     gravy: '-3.500',
    //     aromaticity: '-9.9',
    //     e280_mass_ox: '60390',
    //     e280_mass_red: '13456',
    //     e214_mass: '1355',
    //     e280_molar_ox: '6732',
    //     e280_molar_red: '43722',
    //     e214_molar: '824289'
    //   }
    // };

    // this.PopulateProperties(response.protein);

    // return;
  }

  onRestore(): void {
    // Reset the copy # values to full protein values.
    for (const subunit of this.subunits) {
      this.subunitForm.patchValue({
        [subunit.subunit_name]: subunit.copies
      });
    }

    // Change the property value column header to indicate full protein properties.
    const columnDef = this.targetPropertyGrid.api.getColumnDef('name');
    columnDef.headerName = 'Property (ALL Subunits)';
    this.targetPropertyGrid.api.refreshHeader();

    // Re-populate the properties to full protein values.
    this.PopulateProperties(this.fullProteinProperties);
  }

  // Go back to the current target search.
  onBackToSearch(): void {
    this.router.navigateByUrl('/home/search-targets/back');
  }

  // Go back to the current target details.
  onBackToDetails(): void {
    this.router.navigateByUrl('/home/target-detail/' + this.currentTargetId);
  }

}
