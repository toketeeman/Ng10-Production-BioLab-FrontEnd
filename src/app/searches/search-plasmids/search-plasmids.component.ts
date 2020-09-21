import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit
} from "@angular/core";
import { HttpClient, HttpResponse } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, of } from "rxjs";
import { catchError } from 'rxjs/operators';
import { MatRadioChange } from '@angular/material';

import { AgGridAngular } from "@ag-grid-community/angular";
import { AllModules, Module, FirstDataRenderedEvent } from "@ag-grid-enterprise/all-modules";
import { FileSaverService } from "ngx-filesaver";

import { ErrorDialogService } from "../../dialogs/error-dialog/error-dialog.service";
import { PlasmidSearchStoreService } from "../../services/plasmid-search-store.service";
import { IGridPlasmid } from "../../protein-expression.interface";
import { environment } from "../../../environments/environment";
import { AlertService } from "../../services/alert.service";
import { PlasmidTitlePhraseService } from "../../services/plasmid-title-phrase.service";
import { PlasmidsByPartStoreService } from "../../services/plasmids-by-part-store.service";

@Component({
  templateUrl: "./search-plasmids.component.html",
  styleUrls: ["./search-plasmids.component.scss"]
})
export class SearchPlasmidsComponent implements OnInit, AfterViewInit {
  @ViewChild("agGrid", { static: false }) agGrid: AgGridAngular;

  public modules: Module[] = AllModules;
  searchSet: string[] = [];
  rowData$: Observable<IGridPlasmid[]>;
  rowSelection = "multiple";
  plasmidsUrl: string;
  plasmidSequenceDownloadUrl: string;
  paginationPagesize: number;
  ignoreSelectionChange = false;
  columnDefs;
  defaultColDef;
  downloadMode: string = null;
  downloadIconOpacity = 0.2;
  downloadIconCursor = 'default';
  firstDownloadPlasmidId: string = null;
  downloadRowCount: number = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private errorDialogService: ErrorDialogService,
    private plasmidSearchStoreService: PlasmidSearchStoreService,
    private fileSaverService: FileSaverService,
    private alertService: AlertService,
    private plasmidTitlePhraseService: PlasmidTitlePhraseService,
    private plasmidsByPartStoreService: PlasmidsByPartStoreService) {}

  ngOnInit() {
    this.plasmidsUrl = environment.urls.plasmidsUrl;
    this.plasmidSequenceDownloadUrl = environment.urls.plasmidSequenceDownloadUrl;

    this.defaultColDef = {
      resizable: true
    };

    this.columnDefs = [
      {
        headerName: "Plasmid Id",
        field: "plasmid_id",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '10%'
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
        headerName: "Description",
        field: "description",
        valueFormatter: this.longValueFormatter,
        autoHeight: true,
        width: 300,
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
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      {
        headerName: "Selectable Markers",
        field: "marker",
        valueFormatter: this.longValueFormatter,
        autoHeight: true,
        width: 200,
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
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      { headerName: "Target",
        field: "target_name",
        autoHeight: true,
        width: 200,
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
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      },
      { headerName: "Project",
        field: "project_name",
        autoHeight: true,
        cellStyle: {
          'white-space': 'normal',
          'overflow-wrap': 'break-word',
          width: '20%'
        },
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          applyButton: false,
          clearButton: false
        },
        menuTabs: ["filterMenuTab"],
        cellClass: "text-is-wrapped"
      }
    ];

    this.paginationPagesize = 10;

    // Load the cache for the grid. This is our "working set" of plasmids.
    this.rowData$ = this.http.get<IGridPlasmid[]>(this.plasmidsUrl)
                      .pipe(
                        catchError(error => {
                          this.errorDialogService.openDialogForErrorResponse(
                            error,
                            ['message'],
                            "The plasmid inventory is not available."
                          );
                          const noResults: IGridPlasmid[] = [];
                          return of(noResults);
                        })
                      );
  }

  // This formatter should be used for any field that was generated
  // by the back-end as a comma-separated list string for improved UI visibility.
  longValueFormatter(params) {
    const unspacedValue = params.value.replace(/,\s/g, ",");
    const respacedValue = params.value.replace(/,/g, ", ");
    return respacedValue;
  }

  isExternalFilterPresent(): boolean {
    return true;
  }

  doesExternalFilterPass(node): boolean {
    // The row fields are at node.data.* .
    // console.log("node: ", JSON.stringify(node.data));
    // console.log("node.data.plasmid_id: ", node.data.plasmid_id);
    return this.filterMatch((node.data as IGridPlasmid).plasmid_id);
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
    // We are no longer searching possibly by target or by part, so clear the banner title phrase.
    this.plasmidTitlePhraseService.resetPlasmidTitlePhrase();

    // Compute the search set here from the entered search args.
    const rawSet: string[] = searchArgs.split(',');
    this.searchSet = [];
    for ( const value of rawSet as string[] ) {
      const cleanedValue = value.replace(/\s/g, "").toLowerCase();
      if (cleanedValue.length) {
        this.searchSet.push(cleanedValue);
      }
    }

    // Store the new search state.
    this.plasmidSearchStoreService.storePlasmidSearchState(this.searchSet);

    // Trigger the search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Go back to first page on search button.
    this.plasmidSearchStoreService.resetPlasmidLastSearchedState();
    this.agGrid.gridOptions.api.paginationGoToPage(0);
  }

  onRefresh() {
    // Reset the search args to "everything".
    this.searchSet = [];

    // We are no longer searching possibly by target or by part, so clear the banner title phrase.
    this.plasmidTitlePhraseService.resetPlasmidTitlePhrase();

    // Trigger the search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Go back to first page on refresh button.
    this.plasmidSearchStoreService.resetPlasmidLastSearchedState();
    this.agGrid.gridOptions.api.paginationGoToPage(0);
  }

  onRestore(_: FirstDataRenderedEvent) {
    // Retrieve the last search state and set it here.
    this.searchSet = this.plasmidSearchStoreService.retrievePlasmidSearchState();

    // Trigger the restored target search here.
    this.agGrid.gridOptions.api.setFilterModel(null);  // Cancels all on-going filtering.
    this.agGrid.gridOptions.api.onFilterChanged();     // Fire trigger.

    // Now display the restored search state.
    this.agGrid.gridOptions.columnApi
      .setColumnsVisible([
        'plasmid_id', 'description', 'marker', 'target_name', 'project_name'
      ], true);

    // Finally, initially tune the grid according to the URL request.
    const currentRouteUrl = this.route.snapshot.url;
    const currentRouteUrlLength = currentRouteUrl.length;
    const lastSegment = currentRouteUrl[currentRouteUrlLength - 1].path;

    if (lastSegment === 'back') {
      // URL is requesting grid to return to last-searched page.
      const lastSearchedPageNumber = this.plasmidSearchStoreService.retrievePlasmidLastSearchedState();
      this.agGrid.gridOptions.api.paginationGoToPage(lastSearchedPageNumber);
    } else {
      // Reset target detail store last-searched page number to 0.
      this.plasmidSearchStoreService.resetPlasmidLastSearchedState();  // Not logically necessary, for secure state-syncing only.

      // Check now for special filtering requests and set up grid filtering accordingly.
      const targetName = this.route.snapshot.paramMap.get('targetName');
      const partName = this.route.snapshot.paramMap.get('partName');

      if (targetName) {
        // URL is requesting grid to initially filter on target name.

        // Update the target name column set filter.
        const targetNameFilter = this.agGrid.gridOptions.api.getFilterInstance('target_name');
        targetNameFilter.setModel({ values: [ targetName ]});
        this.agGrid.gridOptions.api.onFilterChanged();

        // Grab current search set caused by the filtering.
        this.CaptureCurrentSearchSet();
      } else if (partName) {
        // URL is requesting grid to initially filter on plasmids belonging to a part.

        // Retrieve the plasmids array via the plasmids array store service and
        // and set the plasmid_id filter with it.
        const plasmids =  this.plasmidsByPartStoreService.retrievePlasmidsByPartState();
        const targetNameFilter = this.agGrid.gridOptions.api.getFilterInstance('plasmid_id');
        targetNameFilter.setModel({ values: plasmids });
        this.agGrid.gridOptions.api.onFilterChanged();

        // Grab current search set caused by the filtering.
        this.CaptureCurrentSearchSet();
      } else {
        // Default: URL is requesting normal plasmids search grid without initial filtering.
        this.searchSet = [];
      }
    }
  }

  OnDownloadModeChange(change: MatRadioChange) {
    this.downloadIconCursor = 'pointer';
    this.downloadIconOpacity = 1.0;
    this.downloadMode = change.value;
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

    this.agGrid.gridOptions.rowBuffer = 20;   // Default is 10. Being generous due to huge list.

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
    // Check for pending Excel download. If so, ignore the row selection event and do nothing.
    if (!this.ignoreSelectionChange) {
      // Store the current target search state before going to the target details.
      this.CaptureCurrentSearchSet();

      // Capture current page number as last-searched page number.
      const lastSearchedPageNumber = this.agGrid.api.paginationGetCurrentPage();
      this.plasmidSearchStoreService.storePlasmidLastSearchedState(lastSearchedPageNumber);

      // Now compute the destination of the details and go there.
      const selectedRow: IGridPlasmid = this.agGrid.gridOptions.api.getSelectedRows()[0];  // Here, always an array of one row.
      this.router.navigateByUrl('/home/plasmid-detail/' + (selectedRow as IGridPlasmid).plasmid_id);
    }
  }

  CaptureCurrentSearchSet() {
    this.searchSet = [];
    this.agGrid.api.forEachNodeAfterFilterAndSort( (rowNode, index) => {
      const cleanedValue = (rowNode.data as IGridPlasmid).plasmid_id.replace(/\s/g, "").toLowerCase();
      if (cleanedValue.length) {
        this.searchSet.push(cleanedValue);
      }
    });
    this.plasmidSearchStoreService.storePlasmidSearchState(this.searchSet);
  }

  onDownload() {
    switch (this.downloadMode) {
      case 'excel':
        this.plasmidExcelDownload();
        break;
      case 'fasta':
        this.fastaDownload();
        break;
      case 'gb':
        this.genbankDownload();
        break;
      default:
        break;
    }
  }

  plasmidExcelDownload() {
    this.ignoreSelectionChange = true;
    let rowCount = 0;

    this.agGrid.api.forEachNode( (rowNode, index) => {
      rowNode.setSelected(false, false);
    });
    this.agGrid.api.forEachNodeAfterFilterAndSort( (rowNode, index) => {
      rowCount++;
      rowNode.setSelected(true, false);
    });

    if (rowCount > 0) {
      const params = {
        fileName: 'PlasmidsSearch',
        onlySelectedAllPages: true
      };
      this.agGrid.api.exportDataAsExcel(params);
    } else {
      this.errorDialogService.openDialogForMessages("No plasmids have been chosen. Plasmid Export is cancelled. Try again.");
    }

    this.agGrid.api.forEachNodeAfterFilterAndSort( (rowNode, index) => {
      rowNode.setSelected(false, false);
    });

    setTimeout( () => { this.ignoreSelectionChange = false; }, 1000 );
  }

  fastaDownload() {
    const downloadUrl = this.buildPlasmidSequenceDownloadUrl();

    if (downloadUrl) {
      if (this.downloadRowCount > 5) {
        if (!this.alertService.confirmGeneral('You will download more than FIVE files. Do you wish to proceed?')) {
          return;
        }
      }

      this.http.get(downloadUrl, { observe: 'response', responseType: 'blob' })
      .pipe(
        catchError(error => {
          this.errorDialogService.openDialogForErrorResponse(
            error,
            ['message'],
            "FASTA downloads failed. See admin."
          );
          return of(null);
        })
      )
      .subscribe((response: HttpResponse<any>) => {
        if (response) {
          this.downloadRowCount === 1 ?
            this.fileSaverService.save(response.body, `${this.firstDownloadPlasmidId}.fasta`) :
            this.fileSaverService.save(response.body, 'FASTA_files.zip');
        }
      });
    } else {
      this.errorDialogService.openDialogForMessages("No plasmids have been chosen. FASTA download is cancelled. Try again.");
    }
  }

  genbankDownload() {
    const downloadUrl = this.buildPlasmidSequenceDownloadUrl();

    if (downloadUrl) {
      if (this.downloadRowCount > 5) {
        if (!this.alertService.confirmGeneral('You will download more than FIVE files. Do you wish to proceed?')) {
          return;
        }
      }

      this.http.get(downloadUrl, { observe: 'response', responseType: 'blob' })
      .pipe(
        catchError(error => {
          this.errorDialogService.openDialogForErrorResponse(
            error,
            ['message'],
            "GenBank downloads failed. See admin."
          );
          return of(null);
        })
      )
      .subscribe((response: HttpResponse<any>) => {
        if (response) {
          this.downloadRowCount === 1 ?
            this.fileSaverService.save(response.body, `${this.firstDownloadPlasmidId}.gb`) :
            this.fileSaverService.save(response.body, 'GenBank_files.zip');
        }
      });
    } else {
      this.errorDialogService.openDialogForMessages("No plasmids have been chosen. GenBank download is cancelled. Try again.");
    }
  }

  // Build the URL for downloading FASTA/GenBank files corresponding to the
  // currently displayed plasmids. If no plasmids are displayed, a null is returned.
  // Note the two side effects here.
  buildPlasmidSequenceDownloadUrl(): string {
    let rowCount = 0;
    let fullPlasmidSequenceDownloadUrl = '';
    fullPlasmidSequenceDownloadUrl = this.plasmidSequenceDownloadUrl + '?plasmid_id=';
    this.agGrid.api.forEachNodeAfterFilterAndSort( (rowNode, index) => {
      if (!rowCount) {
        this.firstDownloadPlasmidId = rowNode.data.plasmid_id;   // Side effect.
        fullPlasmidSequenceDownloadUrl = fullPlasmidSequenceDownloadUrl.concat(rowNode.data.plasmid_id);
      } else {
        fullPlasmidSequenceDownloadUrl = fullPlasmidSequenceDownloadUrl.concat(',' + rowNode.data.plasmid_id);
      }
      rowCount++;
    });
    this.downloadRowCount = rowCount;      // Side effect.
    return rowCount ? fullPlasmidSequenceDownloadUrl.concat(`&file_format=${this.downloadMode}`) : null;
  }
}
