import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlasmidSearchStoreService {
  private searchSetState: string[] = [];
  private lastSearchedPageNumberState = 0;  // Here internally from ag-Grid, indexed from 0. On display, indexed from 1.

  constructor() { }

  resetPlasmidSearchSetState(): void {
    this.searchSetState = [];
  }

  retrievePlasmidSearchState(): string[] {
    return this.searchSetState;
  }

  storePlasmidSearchState(searchSet: string[]): void {
    this.searchSetState = searchSet;
  }

  resetPlasmidLastSearchedState(): void {
    this.lastSearchedPageNumberState = 0;
  }

  retrievePlasmidLastSearchedState(): number {
    return this.lastSearchedPageNumberState;
  }

  storePlasmidLastSearchedState(lastSearchedPageNumber: number): void {
    this.lastSearchedPageNumberState = lastSearchedPageNumber;
  }
}
