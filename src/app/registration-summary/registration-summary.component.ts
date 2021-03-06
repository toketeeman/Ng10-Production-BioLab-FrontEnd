import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,  // Needed only to handle ngu-carousel Github issue #83.
  ChangeDetectorRef         // Needed only to handle ngu-carousel Github issue #83.
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { MatAccordion } from '@angular/material/expansion';

import { AgGridAngular } from '@ag-grid-community/angular';
import { AllModules, Module } from '@ag-grid-enterprise/all-modules';
import { NguCarouselConfig } from '@ngu/carousel';

import {
  ITargetDetail,
  ISubunit,
  ISubunitInteraction,
  ITargetDetailHeader,
  IPostTranslationalModification
} from '../protein-expression.interface';
import { TargetDetailStoreService } from '../services/target-detail-store.service';

@Component({
  templateUrl: './registration-summary.component.html',
  styleUrls: ['./registration-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegistrationSummaryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('targetHeaderGrid', { static: false }) targetHeaderGrid: AgGridAngular;
  @ViewChild('subunitInteractionsGrid', { static: false }) subunitInteractionsGrid: AgGridAngular;
  @ViewChild('ptmsGrid', { static: false }) ptmsGrid: AgGridAngular;
  @ViewChild('dnaSeqAccordion', { static: false }) dnaSeqAccordion: MatAccordion;

  private destroyed$ = new Subject();
  public modules: Module[] = AllModules;
  detailData$: Observable<ITargetDetail>;
  targetHeaderData: ITargetDetailHeader[];          // UI-bound data.
  subunitInteractionsData: ISubunitInteraction[];   // UI-bound data.
  ptmsData: IPostTranslationalModification[];       // UI-bound data.
  targetHeaderColumnDefs;
  subunitInteractionsColumnDefs;
  ptmsColumnDefs;
  subunits: ISubunit[] = [];
  currentTargetId: string;
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

  constructor(
    private targetDetailStoreService: TargetDetailStoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    // Configure target header grid.
    this.targetHeaderColumnDefs = [
      {
        headerName: 'Target Name',
        headerClass: 'target-detail-header',
        field: 'target_name',
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
        headerName: 'Partner',
        headerClass: 'target-detail-header',
        field: 'partner',
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: [],
      },
      {
        headerName: 'Protein Class',
        headerClass: 'target-detail-header',
        field: 'protein_class_name',
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
        headerName: 'Project Name',
        headerClass: 'target-detail-header',
        field: 'project_name',
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
        headerName: 'Notes',
        headerClass: 'target-detail-header',
        field: 'notes',
        autoHeight: true,
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
        headerName: 'Subunit Name',
        headerClass: 'target-detail-header',
        field: 'subunit_one_name',
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
        headerName: 'Copy #',
        headerClass: 'target-detail-header',
        field: 'subunit_one_copy',
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
        headerName: 'Interaction Type',
        headerClass: 'target-detail-header',
        field: 'interaction',
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
        headerName: 'Subunit Name',
        headerClass: 'target-detail-header',
        field: 'subunit_two_name',
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
        headerName: 'Copy #',
        headerClass: 'target-detail-header',
        field: 'subunit_two_copy',
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      }
    ];

    // Configure post translational modifications grid.
    this.ptmsColumnDefs = [
      {
        headerName: 'Subunit Name',
        headerClass: 'target-detail-header',
        field: 'subunit_one_name',
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        }
      },
      {
        headerName: 'Copy #',
        headerClass: 'target-detail-header',
        field: 'subunit_one_copy',
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
        headerName: 'Residue #',
        headerClass: 'target-detail-header',
        field: 'subunit_one_residue',
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
        headerName: 'Subunit Name',
        headerClass: 'target-detail-header',
        field: 'subunit_two_name',
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
        headerName: 'Copy #',
        headerClass: 'target-detail-header',
        field: 'subunit_two_copy',
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
        headerName: 'Residue #',
        headerClass: 'target-detail-header',
        field: 'subunit_two_residue',
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
        headerName: 'PTM',
        headerClass: 'target-detail-header',
        field: 'ptm',
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          'font-weight': 'bold'
        },
        sortable: false,
        menuTabs: []
      }
    ];

    this.detailData$ = this.targetDetailStoreService.retrieveTargetDetailStore();

    this.detailData$
      .pipe(
        map((targetDetail: ITargetDetail) => targetDetail.target),
        take(1),
        takeUntil(this.destroyed$)
      ).subscribe(targetDetailHeader => {
        this.targetHeaderData = [
          {
            target_name: targetDetailHeader.target_name,
            partner: targetDetailHeader.partner,
            protein_class_name: targetDetailHeader.protein_class_name,
            project_name: targetDetailHeader.project_name,
            notes: targetDetailHeader.notes
          },
          {
            target_name: null,      // Dirty fix to prevent resizing flicking by grid.
            partner: null,
            protein_class_name: null,
            project_name: null,
            notes: null
          },
        ];
        this.subunits = targetDetailHeader.subunits;
      });

    this.detailData$
      .pipe(
        map((targetDetail: ITargetDetail) => targetDetail.interactions),
        take(1),
        takeUntil(this.destroyed$)
      ).subscribe(subunitInteractions => {
        subunitInteractions.push({    // Dirty fix to prevent resizing flickering by grid.
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

  ngAfterViewInit(): void {
    // Responsive window behavior.
    this.targetHeaderGrid.api.sizeColumnsToFit();
    this.subunitInteractionsGrid.api.sizeColumnsToFit();
    this.ptmsGrid.api.sizeColumnsToFit();

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

    this.cdr.detectChanges();
  }

  // Clean up the subscriptions.
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
