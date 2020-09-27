import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { MatBadgeModule} from '@angular/material/badge';
import { MatCardModule} from '@angular/material/card';
import { MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { NguCarouselModule } from '@ngu/carousel';
import { AgGridModule } from '@ag-grid-community/angular';
import { FileSaverModule } from 'ngx-filesaver';
import { BackButtonDisableModule } from 'angular-disable-browser-back-button';

import { AppRoutingModule } from './app-routing.module';
import { InMemoryDataService } from './services/in-memory-data.service';
import { TokenInterceptor } from './services/token.interceptor';
import { AppComponent } from './app.component';
import { NewTargetComponent } from './new-target/new-target.component';
import { SubunitInteractionsComponent } from './subunit-interactions/subunit-interactions.component';
import { LoginFormComponent } from './auth/login-form/login-form.component';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { environment } from '../environments/environment';
import { SearchPlasmidsComponent } from './searches/search-plasmids/search-plasmids.component';
import { SearchTargetsComponent } from './searches/search-targets/search-targets.component';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { TargetDetailComponent } from './searches/target-detail/target-detail.component';
import { InteractionAddDeleteRendererComponent } from './searches/target-detail/interaction-add-delete-renderer.component';
import { PtmAddDeleteRendererComponent } from './searches/target-detail/ptm-add-delete-renderer.component';
import { InteractionEditRendererComponent } from './searches/target-detail/interaction-edit-renderer.component';
import { PtmEditRendererComponent } from './searches/target-detail/ptm-edit-renderer.component';
import { RegistrationSummaryComponent } from './registration-summary/registration-summary.component';
import { TargetPropertyComponent } from './searches/target-property/target-property.component';
import { ErrorDialogComponent } from './dialogs/error-dialog/error-dialog.component';
import { AddGenesDialogComponent } from './dialogs/update-dialog/add-genes-dialog/add-genes-dialog.component';
import { PlasmidDetailComponent } from './searches/plasmid-detail/plasmid-detail.component';
import { FeatureQualifierRendererComponent } from './searches/plasmid-detail/feature-qualifier-renderer.component';
import { PlasmidCountRendererComponent } from './searches/search-targets/plasmid-count-renderer.component';
import { SearchPartsComponent } from './searches/search-parts/search-parts.component';
import { PlasmidsRendererComponent } from './searches/search-parts/plasmids-renderer.component';
import { AddInteractionDialogComponent } from './dialogs/update-dialog/add-interaction-dialog/add-interaction-dialog.component';
import { EditInteractionDialogComponent } from './dialogs/update-dialog/edit-interaction-dialog/edit-interaction-dialog.component';
import { DeleteInteractionDialogComponent } from './dialogs/update-dialog/delete-interaction-dialog/delete-interaction-dialog.component';
import { AddPtmDialogComponent } from './dialogs/update-dialog/add-ptm-dialog/add-ptm-dialog.component';
import { EditPtmDialogComponent } from './dialogs/update-dialog/edit-ptm-dialog/edit-ptm-dialog.component';
import { DeletePtmDialogComponent } from './dialogs/update-dialog/delete-ptm-dialog/delete-ptm-dialog.component';
import { ToolsComponent } from './tools/tools.component';

const appImports = [
  BrowserModule,
  AppRoutingModule,
  BrowserAnimationsModule,
  HttpClientModule,
  MatBadgeModule,
  MatCardModule,
  MatButtonToggleModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSliderModule,
  MatMenuModule,
  MatButtonModule,
  MatDividerModule,
  MatExpansionModule,
  MatTooltipModule,
  MatDialogModule,
  ReactiveFormsModule,
  FlexLayoutModule,
  NguCarouselModule,
  AgGridModule.withComponents([
    BrowserAnimationsModule,
    FeatureQualifierRendererComponent,
    PlasmidCountRendererComponent,
    PlasmidsRendererComponent,
    InteractionAddDeleteRendererComponent,
    PtmAddDeleteRendererComponent,
    InteractionEditRendererComponent,
    PtmEditRendererComponent
  ]),
  FileSaverModule,
  BackButtonDisableModule.forRoot({
    preserveScrollPosition: true
  })
];

console.log('STARTUP: PTDB is running in ' + environment.configuration + ' configuration mode.');

if (!environment.production && environment.inMemoryData) {
  console.log(
    'STARTUP: PTDB is running in Angular development mode, i.e. double-change-detection. In-Memory DB will be the backend.'
  );
  appImports.push(
    // The HttpClientInMemoryWebApiModule module intercepts HTTP requests
    // and returns simulated server responses.
    HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
      dataEncapsulation: false
    })
  );
} else {
  console.log(
    'STARTUP: PTDB is running Angular production mode, i.e. single-change-detection. Backend is dictated by replaced environment.ts .'
  );
}

@NgModule({
  declarations: [
    AppComponent,
    NewTargetComponent,
    SubunitInteractionsComponent,
    LoginFormComponent,
    HomeComponent,
    PageNotFoundComponent,
    SearchPlasmidsComponent,
    SearchTargetsComponent,
    AutoFocusDirective,
    ErrorDialogComponent,
    PlasmidDetailComponent,
    FeatureQualifierRendererComponent,
    PlasmidCountRendererComponent,
    PlasmidsRendererComponent,
    TargetDetailComponent,
    InteractionAddDeleteRendererComponent,
    PtmAddDeleteRendererComponent,
    InteractionEditRendererComponent,
    PtmEditRendererComponent,
    RegistrationSummaryComponent,
    TargetPropertyComponent,
    AddGenesDialogComponent,
    SearchPartsComponent,
    AddInteractionDialogComponent,
    EditInteractionDialogComponent,
    DeleteInteractionDialogComponent,
    AddPtmDialogComponent,
    EditPtmDialogComponent,
    DeletePtmDialogComponent,
    ToolsComponent
  ],
  imports: appImports,
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
