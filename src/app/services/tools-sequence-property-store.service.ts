import { Injectable } from '@angular/core';

import { ISequenceProperties } from '../protein-expression.interface';

@Injectable({
  providedIn: 'root'
})
export class ToolsSequencePropertyStoreService {
  private returnedSequenceProperties: ISequenceProperties = null;
  private selectionType = '';
  private enteredDNASequence = '';   // If any.

  constructor() { }

  resetToolsSequencePropertyState(): void {
    this.returnedSequenceProperties = null;
    this.selectionType = '';
    this.enteredDNASequence = '';
  }

  retrieveToolsSequencePropertyState(): any {
    return {
      returnedSequenceProperties: this.returnedSequenceProperties,
      selectionType: this.selectionType,
      enteredDNASequence: this.enteredDNASequence
    };
  }

  storeToolsSequencePropertyState(
    sequenceProperties: ISequenceProperties,
    selectionType: string,
    enteredDNASequence: string
  ): void {
    this.returnedSequenceProperties = sequenceProperties;
    this.selectionType = selectionType;
    this.enteredDNASequence = enteredDNASequence;
  }
}
