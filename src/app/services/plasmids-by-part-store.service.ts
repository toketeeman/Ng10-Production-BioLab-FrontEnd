import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlasmidsByPartStoreService {
  private plasmidsByPartState: string[] = [];

  constructor() { }

  resetPlasmidsByPartState() {
    this.plasmidsByPartState = [];
  }

  retrievePlasmidsByPartState(): string[] {
    return this.plasmidsByPartState;
  }

  storePlasmidsByPartState(plasmids: string[]): void {
    this.plasmidsByPartState = plasmids;
  }
}
