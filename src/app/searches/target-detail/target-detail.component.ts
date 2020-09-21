import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, of, Subject } from "rxjs";
import { catchError, map, take, takeUntil, shareReplay } from 'rxjs/operators';
import { MatAccordion } from '@angular/material/expansion';

import { AgGridAngular } from "@ag-grid-community/angular";
import { AllModules, Module, ValueGetterParams } from "@ag-grid-enterprise/all-modules";
import { NguCarouselConfig } from '@ngu/carousel';

import {
  IGene,
  ITargetDetail,
  ISubunit,
  ISubunitInteraction,
  ITargetDetailHeader,
  IPostTranslationalModification
} from "../../protein-expression.interface";
import { AuthenticationService } from '../../services/authentication.service';
import { ErrorDialogService } from "../../dialogs/error-dialog/error-dialog.service";
import { UpdateDialogService } from '../../dialogs/update-dialog/update-dialog.service';
import { environment } from "../../../environments/environment";
import { InteractionEditRenderer } from './interaction-edit-renderer.component';
import { PtmEditRenderer } from './ptm-edit-renderer.component';
import { InteractionAddDeleteRenderer } from './interaction-add-delete-renderer.component';
import { PtmAddDeleteRenderer } from './ptm-add-delete-renderer.component';

@Component({
  templateUrl: './target-detail.component.html',
  styleUrls: ['./target-detail.component.scss']
})
export class TargetDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("targetHeaderGrid", { static: false }) targetHeaderGrid: AgGridAngular;
  @ViewChild("subunitInteractionsGrid", { static: false }) subunitInteractionsGrid: AgGridAngular;
  @ViewChild("ptmsGrid", { static: false }) ptmsGrid: AgGridAngular;
  @ViewChild('dnaSeqAccordion', { static: false }) dnaSeqAccordion: MatAccordion;

  private destroyed$ = new Subject();
  public modules: Module[] = AllModules;
  public domLayout;
  detailData$: Observable<ITargetDetail>;
  targetDetailHeader: ITargetDetailHeader;          // Total target details fetched from DB.
  targetHeaderData: ITargetDetailHeader[];          // UI-bound data.
  subunits: ISubunit[] = [];                        // UI-bound data.
  subunitInteractionsData: ISubunitInteraction[];   // UI-bound data.
  ptmsData: IPostTranslationalModification[];       // UI-bound data.
  currentTargetId: string;                          // Ui-bound data.
  defaultColDef;
  targetHeaderColumnDefs;
  subunitInteractionsColumnDefs;
  ptmsColumnDefs;
  targetsDetailUrl: string;
  carouselConfig: NguCarouselConfig = {
    grid: { xs: 1, sm: 2, md: 2, lg: 2, all: 0 },
    slide: 1,
    speed: 400,
    point: {
      visible: true,
      hideOnSingleSlide: true
    },
    easing: 'cubic-bezier(0, 0, 0.2, 1)'
  };
  subunitsAreHovered = false;
  isSubmitter: boolean;

  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService,
    private errorDialogService: ErrorDialogService,
    private updateDialogService: UpdateDialogService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.isSubmitter = this.authenticationService.hasSubmitterRole();

    this.currentTargetId = this.route.snapshot.paramMap.get('id');

    if (environment.inMemoryData) {
      this.targetsDetailUrl = environment.urls.targetsDetailUrl;
    } else {
      this.targetsDetailUrl = environment.urls.targetsDetailUrl + '?target_id=' + this.currentTargetId;
    }

    this.domLayout = 'autoHeight';

    // Shared by all grids.
    this.defaultColDef = {
      resizable: true
    };

    // Configure target header grid.
    this.targetHeaderColumnDefs = [
      {
        headerName: "Target Name",
        headerClass: "target-detail-header",
        field: "target_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold',
          width: '14%'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Partner",
        headerClass: "target-detail-header",
        field: "partner",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold',
          width: '14%'
        },
        sortable: false,
        menuTabs: [],
      },
      {
        headerName: "Protein Class",
        headerClass: "target-detail-header",
        field: "protein_class_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold',
          width: '14%'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Project Name",
        headerClass: "target-detail-header",
        field: "project_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold',
          width: '14%'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Notes",
        headerClass: "target-detail-header",
        field: "notes",
        autoHeight: true,
        width: 400,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      }
    ];

    // Configure subunit interactions grid.
    this.subunitInteractionsColumnDefs = [
      {
        field: "subunit_interaction_id",
        hide: true
      },
      {
        headerName: "Subunit Name",
        headerClass: "target-detail-header",
        field: "subunit_one_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Copy #",
        headerClass: "target-detail-header",
        field: "subunit_one_copy",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Interaction Type",
        headerClass: "target-detail-header",
        field: "interaction",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Subunit Name",
        headerClass: "target-detail-header",
        field: "subunit_two_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Copy #",
        headerClass: "target-detail-header",
        field: "subunit_two_copy",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "",
        headerClass: "target-detail-header",
        valueGetter: (_: ValueGetterParams) => null,
        autoHeight: true,
        minWidth: 40,
        maxWidth: 70,
        sortable: false,
        menuTabs: [],
        cellRendererFramework: InteractionEditRenderer
      },
      {
        headerName: "",
        headerClass: "target-detail-header",
        valueGetter: (_: ValueGetterParams) => null,
        autoHeight: true,
        minWidth: 40,
        maxWidth: 70,
        sortable: false,
        menuTabs: [],
        cellRendererFramework: InteractionAddDeleteRenderer
      }
    ];

    // Configure post translational modifications grid.
    this.ptmsColumnDefs = [
      {
        field: "subunit_ptm_id",
        hide: true
      },
      {
        headerName: "Subunit Name",
        headerClass: "target-detail-header",
        field: "subunit_one_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Copy #",
        headerClass: "target-detail-header",
        field: "subunit_one_copy",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Residue Number",
        headerClass: "target-detail-header",
        field: "subunit_one_residue",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Subunit Name",
        headerClass: "target-detail-header",
        field: "subunit_two_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Copy #",
        headerClass: "target-detail-header",
        field: "subunit_two_copy",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "Residue Number",
        headerClass: "target-detail-header",
        field: "subunit_two_residue",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "PTM",
        headerClass: "target-detail-header",
        field: "ptm",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      },
      {
        headerName: "",
        headerClass: "target-detail-header",
        field: "option_1",
        valueGetter: (_: ValueGetterParams) => null,
        autoHeight: true,
        minWidth: 40,
        maxWidth: 70,
        sortable: false,
        menuTabs: [],
        cellRendererFramework: PtmEditRenderer
      },
      {
        headerName: "",
        headerClass: "target-detail-header",
        field: "option_2",
        valueGetter: (_: ValueGetterParams) => null,
        autoHeight: true,
        minWidth: 40,
        maxWidth: 70,
        sortable: false,
        menuTabs: [],
        cellRendererFramework: PtmAddDeleteRenderer
      }
    ];

    // Grab ALL the target's details now for UI binding.
    this.getTargetDetailData();
  }

  getTargetDetailData(): void {
    this.detailData$ = this.http.get<ITargetDetail>(this.targetsDetailUrl)
      .pipe(
        shareReplay(1),
        catchError(error => {
          this.errorDialogService.openDialogForErrorResponse(
            error,
            ['message'],
            "Details for this target could not be found."
          );
          const noResult: ITargetDetail = null;
          return of(noResult);
        })
      );

    this.detailData$
      .pipe(
        map((targetDetail: ITargetDetail) => targetDetail.target),
        take(1),
        takeUntil(this.destroyed$)
      ).subscribe(targetDetailHeader => {
        this.targetDetailHeader = targetDetailHeader;
        this.targetHeaderData = [
          {
            target_name: targetDetailHeader.target_name,
            partner: targetDetailHeader.partner,
            protein_class_name: targetDetailHeader.protein_class_name,
            project_name: targetDetailHeader.project_name,
            notes: targetDetailHeader.notes
          },
          {
            target_name: null,      // Allows nice placement of add buttons.
            partner: null,
            protein_class_name: null,
            project_name: null,
            notes: null
          },
        ];
        this.subunits = targetDetailHeader.subunits;

        // Pass local context to interaction and ptm renderers and their associated dialogs.
        this.subunitInteractionsGrid.gridOptions.context = {
          subunits: this.subunits,
          refreshTargetDetails: this.getTargetDetailData.bind(this)
        };
        this.ptmsGrid.gridOptions.context = {
          subunits: this.subunits,
          refreshTargetDetails: this.getTargetDetailData.bind(this)
        };
      });

    this.detailData$
      .pipe(
        map((targetDetail: ITargetDetail) => targetDetail.interactions),
        take(1),
        takeUntil(this.destroyed$)
      ).subscribe(subunitInteractions => {
        subunitInteractions.push({    // Allows nice placement of add buttons.
          subunit_one_name: null,
          subunit_one_copy: null,
          subunit_two_name: null,
          subunit_two_copy: null,
          interaction: null
        });
        this.subunitInteractionsData = subunitInteractions;
      });

    this.detailData$
      .pipe(
        map((targetDetail: ITargetDetail) => targetDetail.ptms),
        take(1),
        takeUntil(this.destroyed$)
      ).subscribe(ptms => {
        ptms.push({                   // Dirty fix to prevent resizing flicking by grid.
          subunit_one_name: null,
          subunit_one_copy: null,
          subunit_one_residue: null,
          subunit_two_name: null,
          subunit_two_copy: null,
          subunit_two_residue: null,
          ptm: null
        });
        this.ptmsData = ptms;
      });
  }

  enterSubunits(): void {
    this.subunitsAreHovered = true;
  }

  leaveSubunits(): void {
    this.subunitsAreHovered = false;
  }

  ngAfterViewInit() {
    // Responsive window behavior.
    this.targetHeaderGrid.api.sizeColumnsToFit();
    this.subunitInteractionsGrid.api.sizeColumnsToFit();
    this.ptmsGrid.api.sizeColumnsToFit();

    // Make the page responsive.
    let timeout;
    window.onresize = () => {
      if (timeout) {
        window.cancelAnimationFrame(timeout);
      }
      timeout = window.requestAnimationFrame(
        () => {
          this.targetHeaderGrid.api.sizeColumnsToFit();
          this.subunitInteractionsGrid.api.sizeColumnsToFit();
          this.ptmsGrid.api.sizeColumnsToFit();
        }
      );
    };
  }

  // Clean up the subscriptions.
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  // Go back to the current target search.
  onBackToSearch() {
    this.router.navigateByUrl("/home/search-targets/back");
  }

  // Go inspect the biophysical properties.
  onBiophysicalProperties() {
    this.router.navigateByUrl("/home/target-property/" + this.currentTargetId);
  }

  // Add DNA genes to selected subunit.
  onAddGenes(subunitName: string, genes: IGene[]) {

    // Call dialog for adding genes.
    this.updateDialogService.openDialogForAddingGenes(subunitName, genes)
      .subscribe((result: string) => {
        // If adding genes is successful, refresh the target detail page.
        if (result === 'success') {
          this.getTargetDetailData();
        }

        // If adding genes had been cancelled or had failed, do nothing further here for now.
      });
  }

}
