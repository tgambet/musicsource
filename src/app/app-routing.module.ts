import { NgModule } from '@angular/core';
import { Event, Router, RouterModule, Routes, Scroll } from '@angular/router';
import { LibraryComponent } from '@app/pages/library.component';
import { PageAlbumComponent } from '@app/pages/page-album.component';
import { PageAlbumResolverService } from '@app/resolvers/page-album-resolver.service';
import { PageArtistComponent } from '@app/pages/page-artist.component';
import { PageArtistResolverService } from '@app/resolvers/page-artist-resolver.service';
import { LibraryAlbumsComponent } from '@app/pages/library-albums.component';
import { LibraryArtistsComponent } from '@app/pages/library-artists.component';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';
import { LibraryPlaylistsComponent } from '@app/pages/library-playlists.component';
import { LibrarySongsComponent } from '@app/pages/library-songs.component';
import { PlaylistNewComponent } from '@app/dialogs/playlist-new.component';
import { PagePlaylistComponent } from '@app/pages/page-playlist.component';
import { PagePlaylistResolver } from '@app/resolvers/page-playlist-resolver.service';
import { PlayComponent } from '@app/pages/play.component';
import { WelcomeComponent } from '@app/pages/welcome.component';
import { AppComponent } from '@app/app.component';
import { MainGuard } from '@app/guards/main.guard';

const routes: Routes = [
  //{ path: '', component: HomeComponent, data: { animation: 'default' } },
  {
    path: 'welcome',
    component: WelcomeComponent,
    data: { animation: 'default' },
  },
  // {
  //   outlet: 'dialog',
  //   path: 'settings',
  //   component: SettingsComponent,
  //   children: [
  //     { path: '', redirectTo: 'library', pathMatch: 'full' },
  //     { path: 'library', component: LibrarySettingsComponent },
  //   ],
  // },
  {
    outlet: 'dialog',
    path: 'new-playlist',
    component: PlaylistNewComponent,
  },
  {
    path: '',
    component: AppComponent,
    canActivate: [MainGuard],
    canActivateChild: [MainGuard],
    children: [
      {
        path: '',
        redirectTo: 'library',
        pathMatch: 'full',
        data: { animation: 'default' },
      },
      // {
      //   path: 'home',
      //   component: HomeComponent,
      //   data: { animation: 'default' },
      // },
      // {
      //   path: 'history',
      //   component: HistoryComponent,
      //   data: { animation: 'default' },
      // },
      // {
      //   path: 'explorer',
      //   component: ExplorerComponent,
      //   data: { animation: 'default' },
      // },
      {
        path: 'library',
        component: LibraryComponent,
        data: { animation: 'default' },
        children: [
          { path: '', redirectTo: 'albums', pathMatch: 'full' },
          { path: 'playlists', component: LibraryPlaylistsComponent },
          { path: 'albums', component: LibraryAlbumsComponent },
          { path: 'artists', component: LibraryArtistsComponent },
          { path: 'songs', component: LibrarySongsComponent },
        ],
      },
      // {
      //   path: 'search',
      //   component: SearchComponent,
      //   data: { animation: 'default' },
      // },
      {
        path: 'album/:id',
        component: PageAlbumComponent,
        data: { animation: 'default' },
        resolve: { info: PageAlbumResolverService },
      },
      {
        path: 'artist/:id',
        component: PageArtistComponent,
        data: { animation: 'default' },
        resolve: { info: PageArtistResolverService },
      },
      {
        path: 'playlist/:id',
        component: PagePlaylistComponent,
        data: { animation: 'default' },
        resolve: { info: PagePlaylistResolver },
      },
      // {
      //   path: 'likes',
      //   data: { animation: 'default' },
      //   component: PagePlaylistLikesComponent,
      // },
      {
        path: 'play',
        component: PlayComponent,
        data: { animation: 'PlayPage' },
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      relativeLinkResolution: 'corrected',
      scrollPositionRestoration: 'disabled',
      // anchorScrolling: 'enabled',
      // onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(router: Router, viewportScroller: ViewportScroller) {
    router.events
      .pipe(filter((e: Event): e is Scroll => e instanceof Scroll))
      .subscribe((e) => {
        if (e.position && e.position[1] === 0) {
          viewportScroller.scrollToPosition([0, 0]);
        } else if (e.position) {
          // backward navigation
          const p = e.position;
          setTimeout(() => viewportScroller.scrollToPosition(p), 10);
          //
          // const getPos$ = defer(() => of(viewportScroller.getScrollPosition()));
          // const scroll$ = defer(() => of(viewportScroller.scrollToPosition(p)));
          //
          // timer(10)
          //   .pipe(
          //     publish((m$) =>
          //       merge(
          //         m$.pipe(
          //           concatMap(() =>
          //             fromEvent(window, 'scroll').pipe(
          //               debounceTime(150),
          //               first()
          //             )
          //           ),
          //           concatMap(() =>
          //             getPos$.pipe(
          //               concatMap((pos) =>
          //                 pos[1] === p[1]
          //                   ? EMPTY
          //                   : throwError('position not matching')
          //               )
          //             )
          //           )
          //         ),
          //         m$.pipe(concatMapTo(scroll$))
          //       )
          //     ),
          //     retry(10)
          //   )
          //   .subscribe();
        } else if (e.anchor) {
          // anchor navigation
          const anchor = e.anchor;
          setTimeout(() => viewportScroller.scrollToAnchor(anchor));
        } else {
          const a = [/library.+#top/, /\/play$/];
          // forward navigation
          if (!a.find((l) => l.test(e.routerEvent.url))) {
            viewportScroller.scrollToPosition([0, 0]);
          }
        }
      });
  }
}
