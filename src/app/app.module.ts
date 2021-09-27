import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { IndexedDBModule } from '@creasource/ngx-idb';
import { CoreModule } from '@app/core/core.module';
import { PlayerModule } from '@app/player/player.module';
import { ScannerModule } from '@app/scanner/scanner.module';
import { RouterModule, Routes } from '@angular/router';
import { MainGuard } from '@app/core/guards/main.guard';
import { PagePlaylistLikesComponent } from '@app/playlist/page-playlist-likes.component';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { reducers } from '@app/core/store';
import { ScrollerService } from '@app/core/services/scroller.service';

/*const routes: Routes = [
  {
    path: 'welcome',
    loadChildren: () =>
      import('./welcome/welcome.module').then((m) => m.WelcomeModule),
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
      {
        path: 'library',
        loadChildren: () =>
          import('./library/library.module').then((m) => m.LibraryModule),
      },
      {
        path: 'album',
        loadChildren: () =>
          import('./album/album.module').then((m) => m.AlbumModule),
      },
      {
        path: 'artist',
        loadChildren: () =>
          import('./artist/artist.module').then((m) => m.ArtistModule),
      },
      {
        path: 'playlist',
        loadChildren: () =>
          import('./playlist/playlist.module').then((m) => m.PlaylistModule),
      },
      {
        path: 'likes',
        data: { animation: 'default' },
        component: PagePlaylistLikesComponent,
      },
      {
        path: 'play',
        loadChildren: () => PlayerModule,
      },
    ],
  },
  { path: '**', component: WelcomeComponent }, // TODO Not found component
];*/

const routes: Routes = [
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
      {
        path: 'library',
        loadChildren: () =>
          import('./library/library.module').then((m) => m.LibraryModule),
      },
      {
        path: 'album',
        loadChildren: () =>
          import('./album/album.module').then((m) => m.AlbumModule),
      },
      {
        path: 'artist',
        loadChildren: () =>
          import('./artist/artist.module').then((m) => m.ArtistModule),
      },
      {
        path: 'playlist',
        loadChildren: () =>
          import('./playlist/playlist.module').then((m) => m.PlaylistModule),
      },
      {
        path: 'likes',
        data: { animation: 'default' },
        component: PagePlaylistLikesComponent,
      },
      {
        path: 'play',
        loadChildren: () => PlayerModule,
      },
    ],
  },
];

@NgModule({
  declarations: [AppComponent],
  imports: [
    RouterModule.forChild(routes),
    StoreModule.forRoot(reducers, {
      runtimeChecks: {
        strictStateSerializability: false,
        strictActionSerializability: false,
        strictStateImmutability: false,
        strictActionImmutability: false,
        strictActionWithinNgZone: false,
        strictActionTypeUniqueness: false,
      },
    }),
    EffectsModule.forRoot([]),
    // StoreDevtoolsModule.instrument({ maxAge: 150, logOnly: true }),
    CoreModule,
    PlayerModule,
    ScannerModule,
    IndexedDBModule.forRoot({
      name: 'musicsource',
      schema: [
        {
          version: 1,
          stores: [
            {
              name: 'entries',
              options: { keyPath: 'path' },
              indexes: ['parent'],
            },
            {
              name: 'songs',
              options: { keyPath: 'entryPath' },
              indexes: [
                { name: 'artists', options: { multiEntry: true } },
                { name: 'genre', options: { multiEntry: true } },
                'album',
                'title',
                'likedOn',
                'lastModified',
              ],
            },
            {
              name: 'pictures',
              options: { keyPath: 'hash' },
            },
            {
              name: 'albums',
              options: { keyPath: 'name' },
              indexes: [
                { name: 'artists', options: { multiEntry: true } },
                'hash',
                'year',
                'albumArtist',
                'likedOn',
                'listenedOn',
                'lastModified',
              ],
            },
            {
              name: 'artists',
              options: { keyPath: 'name' },
              indexes: ['hash', 'likedOn', 'listenedOn', 'lastModified'],
            },
            {
              name: 'playlists',
              options: { keyPath: 'hash' },
              indexes: ['title', 'createdOn', 'listenedOn'],
            },
          ],
        },
      ],
    }),
  ],
  providers: [
    MainGuard,
    ScrollerService,
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 2500,
        panelClass: 'snack',
        horizontalPosition: 'left',
      },
    },
  ],
})
export class AppModule {}
