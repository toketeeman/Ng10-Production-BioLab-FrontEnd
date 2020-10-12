import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AgGridAngular } from '@ag-grid-community/angular';
import { AllModules, Module, FirstDataRenderedEvent, CellClickedEvent } from '@ag-grid-enterprise/all-modules';

import { ErrorDialogService } from '../../dialogs/error-dialog/error-dialog.service';
import { PartSearchStoreService } from '../../services/part-search-store.service';
import { ReturnFromPlasmidsPartStoreService } from '../../services/return-from-plasmids-part-store.service';
import { IGridPart } from '../../protein-expression.interface';
import { PlasmidsRendererComponent } from './plasmids-renderer.component';
import { environment } from '../../../environments/environment';
import { PlasmidsByPartStoreService } from '../../services/plasmids-by-part-store.service';

@Component({
  templateUrl: './search-parts.component.html',
  styleUrls: ['./search-parts.component.scss']
})
export class SearchPartsComponent implements OnInit, AfterViewInit {
  @ViewChild('agGrid', { static: false }) agGrid: AgGridAngular;

  public modules: Module[] = AllModules;
  searchSet: string[] = [];
  rowData$: Observable<IGridPart[]>;
  rowSelection = 'multiple';
  partsUrl: string;
  paginationPagesize: number;
  columnDefs;
  defaultColDef;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private errorDialogService: ErrorDialogService,
    private partSearchStoreService: PartSearchStoreService,
    private plasmidsByPartStoreService: PlasmidsByPartStoreService,
    private returnFromPlasmidsPartStoreService: ReturnFromPlasmidsPartStoreService
  ) {}

  ngOnInit(): void {
    this.partsUrl = environment.urls.partsUrl;

    this.defaultColDef = {
      resizable: true
    };

    this.columnDefs = [
      {
        headerName: 'Part Name',
        field: 'part_name',
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ['filterMenuTab']
      },
      {
        headerName: 'Part Type',
        field: 'part_type',
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ['filterMenuTab']
      },
      {
        headerName: 'Plasmids',
        field: 'plasmids',
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word'
        },
        sortable: false,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ['filterMenuTab'],
        cellRendererFramework: PlasmidsRendererComponent
      }
    ];

    this.paginationPagesize = 15;

    // Load the cache for the grid. This is our "working set" of parts.
    this.rowData$ = this.http.get<IGridPart[]>(this.partsUrl)
    .pipe(
      catchError(error => {
        this.errorDialogService.openDialogForErrorResponse(
          error,
          ['message'],
          'The parts inventory is not available.'
        );
        const noResults: IGridPart[] = [];
        return of(noResults);
      })
    );
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node): boolean {
    // The row fields are at node.data.* .
    return this.filterMatch((node.data as IGridPart).part_name);
  }

  filterMatch(nodeField: string): boolean {
    if (nodeField === undefined) {
      return false;
    }
    if (!this.searchSet.length) {
      return true;
    }
    const cleanNodeField = nodeField.replace(/\s/g, '').toLowerCase();
    for ( const searchValue of this.searchSet as string[] ) {
      if (cleanNodeField === searchValue) {
        return true;
      }
    }
    return false;
  }

  onReturnKeySearch(event: KeyboardEvent): void {
    event.stopPropagation();
    event.preventDefault();
    const searchArgs = (event.target as HTMLInputElement).value;
    this.onSearch(searchArgs);
  }

  onSearch(searchArgs: string): void {
    // Compute the search set here from the entered search args.
    const rawSet: string[] = searchArgs.split(',');
    this.searchSet = [];
    for ( const value of rawSet as string[]) {
      const cleanedValue = value.replace(/\s/g, '').toLowerCase();
      if (cleanedValue.length) {
        this.searchSet.push(cleanedValue);
      }
    }

    // Store the new search state.
    this.partSearchStoreService.storePartSearchState(this.searchSet);

    // Trigger the entered part search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Go back to first page on search button.
    this.partSearchStoreService.resetPartLastSearchedState();
    this.agGrid.gridOptions.api.paginationGoToPage(0);
  }

  onRefresh(): void {
    // Reset the search args to "show me everything".
    this.searchSet = [];
    this.partSearchStoreService.resetPartSearchSetState();

    // Trigger the refresh part search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Go back to first page on refresh button.
    this.partSearchStoreService.resetPartLastSearchedState();
    this.agGrid.gridOptions.api.paginationGoToPage(0);
  }

  onRestore(_: FirstDataRenderedEvent): void {
    const currentRouteUrl = this.route.snapshot.url;
    const currentRouteUrlLength = currentRouteUrl.length;
    const path = currentRouteUrl[currentRouteUrlLength - 1].path;

    // Restore the search set.
    if (path === 'back') {
      const lastSearchedPageNumber = this.partSearchStoreService.retrievePartLastSearchedState();
      this.agGrid.gridOptions.api.paginationGoToPage(lastSearchedPageNumber);
    } else if (path === 'back-from-plasmids') {
      this.searchSet = this.returnFromPlasmidsPartStoreService.retrieveReturnSearchSetState();
    } else {
      this.searchSet = this.partSearchStoreService.retrievePartSearchState();
    }

    // Trigger the restored part search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Now display the restored search state.
    this.agGrid.gridOptions.columnApi
      .setColumnsVisible([
        'part_name', 'part_type', 'plasmids'
      ], true);

    // Finally set the grid to the last-searched page.
    if (path === 'back') {
      const lastSearchedPageNumber = this.partSearchStoreService.retrievePartLastSearchedState();
      this.agGrid.gridOptions.api.paginationGoToPage(lastSearchedPageNumber);
    } else if (path === 'back-from-plasmids') {
      const lastSearchedPageNumber = this.returnFromPlasmidsPartStoreService.retrieveReturnLastSearchedState();
      this.agGrid.gridOptions.api.paginationGoToPage(lastSearchedPageNumber);
    } else {
      this.partSearchStoreService.resetPartLastSearchedState();
      this.agGrid.gridOptions.api.paginationGoToPage(0);
    }
  }

  ngAfterViewInit(): void {
    // Grid options can finally be set at this point.
    this.agGrid.gridOptions.animateRows = true;

    // Note: these two local class methods below are called internally by the ag-Grid,
    // and thus their class closures are lost, making it impossible to call any other
    // class methods within them if needed. So use .bind(this) when adding this method
    // to the gridOptions.
    this.agGrid.gridOptions.isExternalFilterPresent = this.isExternalFilterPresent.bind(
      this
    );
    this.agGrid.gridOptions.doesExternalFilterPass = this.doesExternalFilterPass.bind(
      this
    );

    this.agGrid.gridOptions.defaultColDef = {
      filter: true
    };

    this.agGrid.gridOptions.rowBuffer = 10;   // In fact, the default is also 10

    // Restore the current search state once the grid cache has been loaded.
    this.agGrid.gridOptions.onFirstDataRendered = this.onRestore.bind(this);

    // Responsive window behavior.
    this.agGrid.api.sizeColumnsToFit();
    window.onresize = () => {
      this.agGrid.api.sizeColumnsToFit();
    };
  }

  onSelectionChanged(): void {
    // Capture current page number as last-searched page number.
    const lastSearchedPageNumber = this.agGrid.api.paginationGetCurrentPage();
    this.partSearchStoreService.storePartLastSearchedState(lastSearchedPageNumber);

    // Now compute the destination of the details and go there.
    const selectedRow: IGridPart = this.agGrid.gridOptions.api.getSelectedRows()[0];  // Here, always an array of one row.

    // NOTE: "Uncomment this line below to gain access to the Parts Details page when it has been fully implemented (GitHub Issue #84).
    // this.router.navigateByUrl('/home/part-detail/' + (selectedRow as IGridPart).part_name);
  }

  onCellClicked(event: CellClickedEvent): void {
    const columnId = event.column.getColId();
    if (columnId === 'plasmids') {
      // Plasmids column has been clicked.

      // Save the current search state for returning from the plasmids page.
      this.returnFromPlasmidsPartStoreService.storeReturnState(this.searchSet, this.agGrid.api.paginationGetCurrentPage());

      // Collect the plasmids array in the cell and store it to be used on plasmids page.
      // and go to plasmids search to show their details.
      const plasmids = (event.node.data as IGridPart).plasmids;
      this.plasmidsByPartStoreService.storePlasmidsByPartState(plasmids);

      // Now go to plasmids page to search ONLY for plasmids related to the selected part.
      const part_name = (event.node.data as IGridPart).part_name;
      this.router.navigateByUrl('/home/search-plasmids/by-part/' + part_name);
    } else {
      // Some other field has been clicked. Process it to route to associated part details page in the normal way.
      // Note: Even though only the cell click is captured, ag-Grid nevertheless still "selects" the row in which
      // the cell resides.
      this.onSelectionChanged();
    }


  }

}
