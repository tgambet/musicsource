import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '@app/pages/home.component';
import { LibraryComponent } from '@app/pages/library.component';
import { SearchComponent } from '@app/pages/search.component';
import { HistoryComponent } from '@app/pages/history.component';
import { ExplorerComponent } from '@app/pages/explorer.component';
import { LibrarySettingsComponent } from '@app/dialogs/library-settings.component';
import { SettingsComponent } from '@app/dialogs/settings.component';
import { ScanComponent } from '@app/dialogs/scan.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'search', component: SearchComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'explorer', component: ExplorerComponent },
  {
    path: 'settings',
    outlet: 'dialog',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'library', pathMatch: 'full' },
      { path: 'library', component: LibrarySettingsComponent },
    ],
  },
  {
    path: 'scan',
    outlet: 'dialog',
    component: ScanComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
