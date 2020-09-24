import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReturnFromPlasmidsTargetStoreService {
  private searchSetState: string[] = [];
  private lastSearchedPageNumberState = 0;  // Here internally from ag-Grid, indexed from 0. On display, indexed from 1.

  constructor() { }

  resetReturnState(): void {
    this.searchSetState = [];
    this.lastSearchedPageNumberState = 0;
  }

  retrieveReturnSearchSetState(): string[] {
    return this.searchSetState;
  }

  retrieveReturnLastSearchedState(): number {
    return this.lastSearchedPageNumberState;
  }

  storeReturnState(searchSet: string[], lastSearchedPageNumber: number): void {
    this.searchSetState = searchSet;
    this.lastSearchedPageNumberState = lastSearchedPageNumber;
  }
}
