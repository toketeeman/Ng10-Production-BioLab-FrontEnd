import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlasmidTitlePhraseService {

  private plasmidTitlePhraseSubject = new BehaviorSubject<string>('');
  plasmidTitlePhrase$ = this.plasmidTitlePhraseSubject.asObservable();      // For asynchronous bindings.

  constructor() {}

  resetPlasmidTitlePhrase(): void {
    this.plasmidTitlePhraseSubject.next('');
  }

  getPlasmidTitlePhrase(): Observable<string> {
    return this.plasmidTitlePhrase$;
  }

  setPlasmidTitlePhrase(phrase: string): void {
    this.plasmidTitlePhraseSubject.next(phrase);
  }

}
