import { Injectable } from '@angular/core';
import { ISubunit } from '../protein-expression.interface';

@Injectable({
  providedIn: 'root'
})
export class TargetPropertyStoreService {
  private targetName: string;
  private subunits: ISubunit[] = [];


  constructor() { }

  retrieveTargetPropertyState(): any {
    return {
      target_name: this.targetName,
      subunits: this.subunits
    };
  }

  storeTargetPropertyState(targetName: string, subunits: ISubunit[]): void {
    this.targetName = targetName;
    this.subunits = subunits;
  }
}
