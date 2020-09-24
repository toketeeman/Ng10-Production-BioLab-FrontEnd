import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../services/authentication.service';
import { TargetSearchStoreService } from '../services/target-search-store.service';
import { PlasmidSearchStoreService } from '../services/plasmid-search-store.service';
import { PlasmidTitlePhraseService } from '../services/plasmid-title-phrase.service';


@Component({
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  url = '';
  isAuthenticated = false;
  titlePhrase$: Observable<string>;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private targetSearchStoreService: TargetSearchStoreService,
    private plasmidSearchStoreService: PlasmidSearchStoreService,
    private plasmidTitlePhraseService: PlasmidTitlePhraseService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = !!this.authenticationService.getToken();

    this.titlePhrase$ = this.plasmidTitlePhraseService.getPlasmidTitlePhrase();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentFullUrl = event.url;

        if (currentFullUrl.startsWith('/home/plasmid-detail')) {  // This url suffixes a plasmid id. Shed it.
          this.url = '/home/plasmid-detail';
        } else if (currentFullUrl.startsWith('/home/target-detail')) {   // This url suffixes a target id. Shed it.
          this.url = '/home/target-detail';
        } else if (currentFullUrl.startsWith('/home/target-property')) {   // This url suffixes a target id. Shed it.
          this.url = '/home/target-property';
        } else if (currentFullUrl.startsWith('/home/search-plasmids')) {

          // Add plasmid title phrase if search for plasmids by target.
          if (currentFullUrl.includes('by-target')) {
            const targetName = (currentFullUrl.split('/').slice(-1)[0]).split('%20').join(' ');
            this.plasmidTitlePhraseService.setPlasmidTitlePhrase(`Target: ${targetName}`);
          }

          // Add plasmid title phrase if search for plasmids by part.
          if (currentFullUrl.includes('by-part')) {
            const partName = (currentFullUrl.split('/').slice(-1)[0]).split('%20').join(' ');
            this.plasmidTitlePhraseService.setPlasmidTitlePhrase(`Part: ${partName}`);
          }

          this.url = '/home/search-plasmids';
        } else if (currentFullUrl.startsWith('/home/search-targets')) {   // This url suffixes a target id. Shed it.
          this.url = '/home/search-targets';
        }else {
          this.url = currentFullUrl;
        }
      }
    });
  }

  logout(): void {
    this.authenticationService.logOut();
    this.router.navigateByUrl('/login');
  }

  goToRegisterNewTarget(): void {
    this.resetStores();
    this.router.navigateByUrl('/home/add-target');
  }

  goToSearchTargets(): void {
    this.resetStores();
    this.router.navigateByUrl('/home/search-targets');
  }

  goToSearchPlasmids(): void {
    this.resetStores();
    this.router.navigateByUrl('/home/search-plasmids');
  }

  goToSearchParts(): void {
    this.resetStores();
    this.router.navigateByUrl('/home/search-parts');
  }

  resetStores(): void {
    this.targetSearchStoreService.resetTargetSearchSetState();
    this.targetSearchStoreService.resetTargetLastSearchedState();
    this.plasmidSearchStoreService.resetPlasmidSearchSetState();
    this.plasmidSearchStoreService.resetPlasmidLastSearchedState();
  }

  returnFromPlasmids(titlePhrase: string): void {
    console.log('XXX  returnFromPlasmids', titlePhrase);
  }

  disableForNonSubmitter(): boolean {
    if (!this.authenticationService.hasSubmitterRole()) {
      return true;
    }
    return false;
  }

  disableForNonViewer(): boolean {
    if (!this.authenticationService.hasViewerRole()) {
      return true;
    }
    return false;
  }
}
