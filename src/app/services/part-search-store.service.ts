import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PartSearchStoreService {
  private searchSetState: string[] = [];

  constructor() { }

  resetPartSearchSetState() {
    this.searchSetState = [];
  }

  retrievePartSearchState(): string[] {
    return this.searchSetState;
  }

  storePartSearchState(searchSet: string[]): void {
    this.searchSetState = searchSet;
  }
}
