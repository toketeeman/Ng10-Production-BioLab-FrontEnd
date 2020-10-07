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

    // Angular does not recognize the browser refresh button. DO NOT USE REFRESH!
    window.addEventListener('keyup', this.disableF5);
    window.addEventListener('keydown', this.disableF5);
    window.addEventListener('beforeunload', this.disableRefresh);


    this.isAuthenticated = !!this.authenticationService.getToken();

    this.titlePhrase$ = this.plasmidTitlePhraseService.getPlasmidTitlePhrase();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentFullUrl = event.url;

        if (currentFullUrl.startsWith('/home/plasmid-detail')) {  // This url suffixes a plasmid id. Shed it.
          this.url = '/home/plasmid-detail';
        } else if (currentFullUrl.startsWith('/home/target-detail')) {   // This url suffixes a target id. Shed it.
          this.url = '/home/target-detail';
        } else if (currentFullUrl.startsWith('/home/part-detail')) {   // This url suffixes a part id. Shed it.
          this.url = '/home/part-detail';
        } else if (currentFullUrl.startsWith('/home/target-property')) {   // This url suffixes a target id. Shed it.
          this.url = '/home/target-property';
        } else if (currentFullUrl.startsWith('/home/search-plasmids')) {

          // Add plasmid title phrase if search for plasmids by target.
          if (currentFullUrl.includes('by-target')) {
            const targetName = (currentFullUrl.split('/').slice(-1)[0]).split('%20').join(' ');
            const truncatedTargetName = this.truncateString(targetName, 25);
            this.plasmidTitlePhraseService.setPlasmidTitlePhrase(`Target: ${truncatedTargetName}`);
          }

          // Add plasmid title phrase if search for plasmids by part.
          if (currentFullUrl.includes('by-part')) {
            const partName = (currentFullUrl.split('/').slice(-1)[0]).split('%20').join(' ');
            const truncatedPartName = this.truncateString(partName, 25);
            this.plasmidTitlePhraseService.setPlasmidTitlePhrase(`Part: ${truncatedPartName}`);
          }

          this.url = '/home/search-plasmids';
        } else if (currentFullUrl.startsWith('/home/search-targets')) {   // This url may have a suffix. Shed it.
          this.url = '/home/search-targets';
        } else if (currentFullUrl.startsWith('/home/search-parts')) {   // This url may have a suffix. Shed it.
          this.url = '/home/search-parts';
        }else if (currentFullUrl.startsWith('/home/tools')) {   // This url may have a suffix. Shed it.
          this.url = '/home/tools';
        } else {
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

  goToTools(): void {
    this.resetStores();
    this.router.navigateByUrl('/home/tools');
  }

  resetStores(): void {
    this.targetSearchStoreService.resetTargetSearchSetState();
    this.targetSearchStoreService.resetTargetLastSearchedState();
    this.plasmidSearchStoreService.resetPlasmidSearchSetState();
    this.plasmidSearchStoreService.resetPlasmidLastSearchedState();
  }

  returnFromPlasmids(titlePhrase: string): void {
    this.plasmidTitlePhraseService.resetPlasmidTitlePhrase();
    if (titlePhrase.includes('Part:')) {
      this.router.navigateByUrl('/home/search-parts/back-from-plasmids');
    }
    if (titlePhrase.includes('Target:')) {
      this.router.navigateByUrl('/home/search-targets/back-from-plasmids');
    }
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

  truncateString(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength - 3) + '...';
    } else {
      return text;
    }
  }

  disableF5(e): void {
    if ((e.which || e.keyCode) === 116) {
      e.preventDefault();
    }
  }

  disableRefresh(e): void {
    e.preventDefault();
    e.returnValue = false;
  }
}
