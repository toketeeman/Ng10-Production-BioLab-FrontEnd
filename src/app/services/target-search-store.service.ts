import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TargetSearchStoreService {
  private searchSetState: string[] = [];
  private lastSearchedPageNumberState = 0;  // Here internally from ag-Grid, indexed from 0. On display, indexed from 1.

  constructor() { }

  resetTargetSearchSetState() {
    this.searchSetState = [];
  }

  retrieveTargetSearchState(): string[] {
    return this.searchSetState;
  }

  storeTargetSearchState(searchSet: string[]): void {
    this.searchSetState = searchSet;
  }

  resetTargetLastSearchedState() {
    this.lastSearchedPageNumberState = 0;
  }

  retrieveTargetLastSearchedState() {
    return this.lastSearchedPageNumberState;
  }

  storeTargetLastSearchedState(lastSearchedPageNumber: number) {
    this.lastSearchedPageNumberState = lastSearchedPageNumber;
  }
}
