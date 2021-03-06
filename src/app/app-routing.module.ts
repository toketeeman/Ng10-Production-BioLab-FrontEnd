import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewTargetComponent } from './new-target/new-target.component';
import { SubunitInteractionsComponent } from './subunit-interactions/subunit-interactions.component';
import { LoginFormComponent } from './auth/login-form/login-form.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';
import { SignedOutGuard } from './guards/signed-out.guard';
import { RegistrationSummaryComponent } from './registration-summary/registration-summary.component';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';
import { CanAccessGuard } from './guards/can-access.guard';
import { SubmitAccessGuard } from './guards/submit-access.guard';
import { ViewAccessGuard } from './guards/view-access.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SearchPlasmidsComponent } from './searches/search-plasmids/search-plasmids.component';
import { PlasmidDetailComponent } from './searches/plasmid-detail/plasmid-detail.component';
import { SearchTargetsComponent } from './searches/search-targets/search-targets.component';
import { TargetDetailComponent } from './searches/target-detail/target-detail.component';
import { TargetPropertyComponent } from './searches/target-property/target-property.component';
import { SearchPartsComponent } from './searches/search-parts/search-parts.component';
import { PartDetailComponent } from './searches/part-detail/part-detail.component';
import { ToolsComponent } from './tools/tools.component';
import { SequencePropertiesComponent } from './tools/sequence-properties/sequence-properties.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginFormComponent,
    canActivate: [SignedOutGuard]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'add-target',
        component: NewTargetComponent,
        canActivate: [SubmitAccessGuard],
        canDeactivate: [UnsavedChangesGuard]
      },
      {
        path: 'subunit-interactions',
        component: SubunitInteractionsComponent,
        canActivate: [CanAccessGuard],
        canDeactivate: [UnsavedChangesGuard]
      },
      {
        path: 'success',
        component: RegistrationSummaryComponent,
        canActivate: [CanAccessGuard],
        canDeactivate: [CanAccessGuard]
      },
      {
        path: 'search-plasmids/back',
        canActivate: [ViewAccessGuard],
        component: SearchPlasmidsComponent
      },
      {
        path: 'search-plasmids/by-part/:partName',
        canActivate: [ViewAccessGuard],
        component: SearchPlasmidsComponent
      },
      {
        path: 'search-plasmids/by-target/:targetName',
        canActivate: [ViewAccessGuard],
        component: SearchPlasmidsComponent
      },
      {
        path: 'search-plasmids',
        canActivate: [ViewAccessGuard],
        component: SearchPlasmidsComponent
      },
      {
        path: 'plasmid-detail/:id',
        component: PlasmidDetailComponent
      },
      {
        path: 'search-targets/back-from-plasmids',
        canActivate: [ViewAccessGuard],
        component: SearchTargetsComponent
      },
      {
        path: 'search-targets/back',
        canActivate: [ViewAccessGuard],
        component: SearchTargetsComponent
      },
      {
        path: 'search-targets',
        canActivate: [ViewAccessGuard],
        component: SearchTargetsComponent
      },
      {
        path: 'target-detail/:id',
        component: TargetDetailComponent
      },
      {
        path: 'target-property/:id',
        component: TargetPropertyComponent
      },
      {
        path: 'search-parts/back-from-plasmids',
        canActivate: [ViewAccessGuard],
        component: SearchPartsComponent
      },
      {
        path: 'search-parts/back',
        canActivate: [ViewAccessGuard],
        component: SearchPartsComponent
      },
      {
        path: 'search-parts',
        canActivate: [ViewAccessGuard],
        component: SearchPartsComponent
      },
      {
        path: 'part-detail/:id',
        component: PartDetailComponent
      },
      {
        path: 'tools/back-from-sequence-property',
        canActivate: [ViewAccessGuard],
        component: ToolsComponent
      },
      {
        path: 'tools',
        canActivate: [ViewAccessGuard],
        component: ToolsComponent
      },
      {
        path: 'sequence-property',
        canActivate: [ViewAccessGuard],
        component: SequencePropertiesComponent
      }
    ]
  },
  { path: '', redirectTo: 'home/add-target', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
