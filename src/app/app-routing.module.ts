import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router, Event, Scroll } from '@angular/router';
import { HomeComponent } from '@app/pages/home.component';
import { LibraryComponent } from '@app/pages/library.component';
import { SearchComponent } from '@app/pages/search.component';
import { HistoryComponent } from '@app/pages/history.component';
import { ExplorerComponent } from '@app/pages/explorer.component';
import { LibrarySettingsComponent } from '@app/dialogs/library-settings.component';
import { SettingsComponent } from '@app/dialogs/settings.component';
import { ScanComponent } from '@app/dialogs/scan.component';
import { AlbumPageComponent } from '@app/pages/album-page.component';
import { AlbumPageResolverService } from '@app/resolvers/album-page-resolver.service';
import { ArtistPageComponent } from '@app/pages/artist-page.component';
import { ArtistPageResolverService } from '@app/resolvers/artist-page-resolver.service';
import { LibraryAlbumsComponent } from '@app/pages/library-albums.component';
import { LibraryArtistsComponent } from '@app/pages/library-artists.component';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'library',
    component: LibraryComponent,
    children: [
      { path: '', component: SearchComponent },
      { path: 'playlists', component: SearchComponent },
      { path: 'albums', component: LibraryAlbumsComponent },
      { path: 'artists', component: LibraryArtistsComponent },
      { path: 'songs', component: SearchComponent },
    ],
  },
  { path: 'search', component: SearchComponent },
  {
    path: 'album/:id',
    component: AlbumPageComponent,
    resolve: { info: AlbumPageResolverService },
  },
  {
    path: 'artist/:id',
    component: ArtistPageComponent,
    resolve: { info: ArtistPageResolverService },
  },
  { path: 'playlist/:id', component: HistoryComponent },
  { path: 'listen', component: HistoryComponent },
  {
    outlet: 'dialog',
    path: 'settings',
    component: SettingsComponent,
    children: [
      { path: '', redirectTo: 'library', pathMatch: 'full' },
      { path: 'library', component: LibrarySettingsComponent },
    ],
  },
  {
    outlet: 'dialog',
    path: 'scan',
    component: ScanComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      relativeLinkResolution: 'corrected',
      scrollPositionRestoration: 'disabled',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(router: Router, viewportScroller: ViewportScroller) {
    router.events
      .pipe(filter((e: Event): e is Scroll => e instanceof Scroll))
      .subscribe((e) => {
        if (e.position) {
          // backward navigation
          viewportScroller.scrollToPosition(e.position);
        } else if (e.anchor) {
          // anchor navigation
          viewportScroller.scrollToAnchor(e.anchor);
        } else {
          const a = ['/library/albums', '/library/artists'];
          // forward navigation
          if (!a.find((l) => e.routerEvent.url.includes(l))) {
            viewportScroller.scrollToPosition([0, 0]);
          }
        }
      });
  }
}
