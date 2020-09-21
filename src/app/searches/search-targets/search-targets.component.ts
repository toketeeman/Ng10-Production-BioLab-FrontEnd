import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError } from 'rxjs/operators';

import { AgGridAngular } from "@ag-grid-community/angular";
import { AllModules, Module, FirstDataRenderedEvent, CellClickedEvent } from "@ag-grid-enterprise/all-modules";

import { ErrorDialogService } from "../../dialogs/error-dialog/error-dialog.service";
import { TargetSearchStoreService } from "../../services/target-search-store.service";
import { IGridTarget } from "../../protein-expression.interface";
import { environment } from "../../../environments/environment";
import { PlasmidCountRenderer } from './plasmid-count-renderer.component';

@Component({
  templateUrl: "./search-targets.component.html",
  styleUrls: ["./search-targets.component.scss"]
})
export class SearchTargetsComponent implements OnInit, AfterViewInit {
  @ViewChild("agGrid", { static: false }) agGrid: AgGridAngular;

  public modules: Module[] = AllModules;
  searchSet: string[] = [];
  rowData$: Observable<IGridTarget[]>;
  rowSelection = "multiple";
  targetsUrl: string;
  paginationPagesize: number;
  ignoreSelectionChange = false;
  columnDefs;
  defaultColDef;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private errorDialogService: ErrorDialogService,
    private targetSearchStoreService: TargetSearchStoreService
  ) {}

  ngOnInit() {
    this.targetsUrl = environment.urls.targetsUrl;

    this.defaultColDef = {
      resizable: true
    };

    this.columnDefs = [
      {
        field: "target_id",
        hide: true
      },
      {
        headerName: "Target",
        field: "target_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '14%'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      {
        headerName: "Partner",
        field: "partner_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '14%'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      {
        headerName: "Class",
        field: "class_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '14%'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      {
        headerName: "Subunits",
        field: "subunit_count",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '14%'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      {
        headerName: "Gene Count",
        field: "gene_count",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '14%'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      {
        headerName: "Project",
        field: "project_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '14%'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      {
        headerName: "Plasmid Count",
        field: "plasmid_count",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '14%'
        },
        sortable: false,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ["filterMenuTab"],
        cellRendererFramework: PlasmidCountRenderer,
        cellClass: "text-is-wrapped"
      }
    ];

    this.paginationPagesize = 10;

    // Load the cache for the grid. This is our "working set" of targets.
    this.rowData$ = this.http.get<IGridTarget[]>(this.targetsUrl)
                      .pipe(
                        catchError(error => {
                          this.errorDialogService.openDialogForErrorResponse(
                            error,
                            ['message'],
                            "The target inventory is not available."
                          );
                          const noResults: IGridTarget[] = [];
                          return of(noResults);
                        })
                      );
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node): boolean {
    // The row fields are at node.data.* .
    return this.filterMatch((node.data as IGridTarget).target_name);
  }

  filterMatch(nodeField: string): boolean {
    if (nodeField === undefined) {
      return false;
    }
    if (!this.searchSet.length) {
      return true;
    }
    const cleanNodeField = nodeField.replace(/\s/g, "").toLowerCase();
    for ( const searchValue of this.searchSet as string[] ) {
      if (cleanNodeField === searchValue) {
        return true;
      }
    }
    return false;
  }

  onReturnKeySearch(event: KeyboardEvent) {
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
      const cleanedValue = value.replace(/\s/g, "").toLowerCase();
      if (cleanedValue.length) {
        this.searchSet.push(cleanedValue);
      }
    }

    // Store the new search state.
    this.targetSearchStoreService.storeTargetSearchState(this.searchSet);

    // Trigger the entered target search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Go back to first page on search button.
    this.targetSearchStoreService.resetTargetLastSearchedState();
    this.agGrid.gridOptions.api.paginationGoToPage(0);
  }

  onRefresh() {
    // Reset the search args to "show me everything".
    this.searchSet = [];
    this.targetSearchStoreService.resetTargetSearchSetState();

    // Trigger the refresh target search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Go back to first page on refresh button.
    this.targetSearchStoreService.resetTargetLastSearchedState();
    this.agGrid.gridOptions.api.paginationGoToPage(0);
  }

  onRestore(_: FirstDataRenderedEvent) {
    // Retrieve the last search state and set it here.
    this.searchSet = this.targetSearchStoreService.retrieveTargetSearchState();

    // Trigger the restored target search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Now display the restored search state.
    this.agGrid.gridOptions.columnApi
      .setColumnsVisible([
        'target_name', 'partner_name', 'class_name', 'subunit_count', 'gene_count', 'project_name', 'plasmid_count'
      ], true);

    // Finally set the grid to the last-searched page.
    const currentRouteUrl = this.route.snapshot.url;
    const currentRouteUrlLength = currentRouteUrl.length;
    if (currentRouteUrl[currentRouteUrlLength - 1].path === 'back') {
      // Set grid to last-searched page.
      const lastSearchedPageNumber = this.targetSearchStoreService.retrieveTargetLastSearchedState();
      this.agGrid.gridOptions.api.paginationGoToPage(lastSearchedPageNumber);
    } else {
      // Reset target detail store last-searched page number to 0.
      this.targetSearchStoreService.resetTargetLastSearchedState();  // Not logically necessary, for state-syncing only.
    }
  }

  ngAfterViewInit() {
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

    this.agGrid.gridOptions.rowBuffer = 10;   // In fact, the default is also 10.

    this.agGrid.gridOptions.excelStyles = [
      {
        id: "header",   // This specific id is required here for the headers.
        font: {
          bold: true,
          size: 20
        }
      },
      {
        id: "text-is-wrapped",
        alignment: {
          wrapText: true,
          vertical: "Top",
          horizontal: "Left"
        }
      }
    ];

    // Restore the current search state once the grid cache has been loaded.
    this.agGrid.gridOptions.onFirstDataRendered = this.onRestore.bind(this);

    // Responsive window behavior.
    this.agGrid.api.sizeColumnsToFit();
    window.onresize = () => {
      this.agGrid.api.sizeColumnsToFit();
    };
  }

  onSelectionChanged() {
    // Store the current target search state before going to the target details.
    this.searchSet = [];
    this.agGrid.api.forEachNodeAfterFilterAndSort( (rowNode, index) => {
      const cleanedValue = (rowNode.data as IGridTarget).target_name.replace(/\s/g, "").toLowerCase();
      if (cleanedValue.length) {
        this.searchSet.push(cleanedValue);
      }
    });
    this.targetSearchStoreService.storeTargetSearchState(this.searchSet);

    // Capture current page number as last-searched page number.
    const lastSearchedPageNumber = this.agGrid.api.paginationGetCurrentPage();
    this.targetSearchStoreService.storeTargetLastSearchedState(lastSearchedPageNumber);

    // Now compute the destination of the details and go there.
    const selectedRow: IGridTarget = this.agGrid.gridOptions.api.getSelectedRows()[0];  // Here, always an array of one row.
    this.router.navigateByUrl('/home/target-detail/' + (selectedRow as IGridTarget).target_id);
  }

  onCellClicked(event: CellClickedEvent) {
    const columnId = event.column.getColId();
    if (columnId === 'plasmid_count' ) {
      // Plasmid count value has been clicked.
      const targetName = (event.node.data as IGridTarget).target_name;
      this.router.navigateByUrl('/home/search-plasmids/by-target/' + targetName);
    } else {
      // Some other field has been clicked. Process it to route to associated target details page in the normal way.
      // Note: Even though only the cell click is captured, ag-Grid nevertheless still "selects" the row in which
      // the cell resides.
      this.onSelectionChanged();
    }
  }

  onExcelExport() {
    const params = {
      fileName: 'TargetsSearch',
      onlySelectedAllPages: true
    };

    this.ignoreSelectionChange = true;

    this.agGrid.api.forEachNode( (rowNode, index) => {
      rowNode.setSelected(false, false);
    });
    this.agGrid.api.forEachNodeAfterFilterAndSort( (rowNode, index) => {
      rowNode.setSelected(true, false);
    });

    this.agGrid.api.exportDataAsExcel(params);

    this.agGrid.api.forEachNodeAfterFilterAndSort( (rowNode, index) => {
      rowNode.setSelected(false, false);
    });

    setTimeout( () => { this.ignoreSelectionChange = false; }, 1000 );
  }
}
