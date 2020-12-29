import { NgModule } from '@angular/core';
import { Event, Router, RouterModule, Routes, Scroll } from '@angular/router';
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
import { concatMap, delay, filter, retry } from 'rxjs/operators';
import { LibraryPlaylistsComponent } from '@app/pages/library-playlists.component';
import { LibrarySongsComponent } from '@app/pages/library-songs.component';
import { defer, EMPTY, of, throwError } from 'rxjs';
import { PlaylistDialogComponent } from '@app/dialogs/playlist-dialog.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'explorer', component: ExplorerComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'library',
    component: LibraryComponent,
    children: [
      { path: '', redirectTo: 'playlists', pathMatch: 'full' },
      { path: 'playlists', component: LibraryPlaylistsComponent },
      { path: 'albums', component: LibraryAlbumsComponent },
      { path: 'artists', component: LibraryArtistsComponent },
      { path: 'songs', component: LibrarySongsComponent },
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
  {
    outlet: 'dialog',
    path: 'new-playlist',
    component: PlaylistDialogComponent,
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
          const p = e.position;
          // viewportScroller.scrollToPosition(p);

          const getPos$ = defer(() => of(viewportScroller.getScrollPosition()));
          const scroll$ = defer(() => of(viewportScroller.scrollToPosition(p)));

          scroll$
            .pipe(
              delay(1),
              concatMap(() =>
                getPos$.pipe(
                  concatMap((pos) =>
                    pos[1] === p[1] ? EMPTY : throwError('not matching')
                  )
                )
              ),
              retry(200)
            )
            .subscribe();

          // setTimeout(() => viewportScroller.scrollToPosition(p), 100);
          // setTimeout(() => viewportScroller.scrollToPosition(p), 200);
        } else if (e.anchor) {
          // anchor navigation
          viewportScroller.scrollToAnchor(e.anchor);
        } else {
          const a = [/library.+#top/];
          // forward navigation
          if (!a.find((l) => l.test(e.routerEvent.url))) {
            viewportScroller.scrollToPosition([0, 0]);
          }
        }
      });
  }
}
