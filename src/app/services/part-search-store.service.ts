import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PartSearchStoreService {
  private searchSetState: string[] = [];
  private lastSearchedPageNumberState = 0;  // Here internally from ag-Grid, indexed from 0. On display, indexed from 1.

  constructor() { }

  resetPartSearchSetState(): void {
    this.searchSetState = [];
  }

  retrievePartSearchState(): string[] {
    return this.searchSetState;
  }

  storePartSearchState(searchSet: string[]): void {
    this.searchSetState = searchSet;
  }

  resetPartLastSearchedState(): void {
    this.lastSearchedPageNumberState = 0;
  }

  retrievePartLastSearchedState(): number {
    return this.lastSearchedPageNumberState;
  }

  storePartLastSearchedState(lastSearchedPageNumber: number): void {
    this.lastSearchedPageNumberState = lastSearchedPageNumber;
  }
}
