import { NgModule } from '@angular/core';

import { MainComponent } from './main.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { CoreModule } from '@app/core/core.module';
import { PlayerModule } from '@app/player/player.module';
import { RouterModule, Routes } from '@angular/router';
import { MainGuard } from '@app/main/main.guard';
import { PagePlaylistLikesComponent } from '@app/playlist/page-playlist-likes.component';
import { ScrollerService } from '@app/main/scroller.service';
import { DatabaseModule } from '@app/database/database.module';
import { PlaylistNewComponent } from '@app/core/dialogs/playlist-new.component';
import { ScannerModule } from '@app/scanner/scanner.module';
import { HelperModule } from '@app/helper/helper.module';

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
  // TODO
  {
    outlet: 'dialog',
    path: 'new-playlist',
    component: PlaylistNewComponent,
  },
  {
    path: '',
    component: MainComponent,
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
          import('../library/library.module').then((m) => m.LibraryModule),
      },
      {
        path: 'album',
        loadChildren: () =>
          import('../album/album.module').then((m) => m.AlbumModule),
      },
      {
        path: 'artist',
        loadChildren: () =>
          import('../artist/artist.module').then((m) => m.ArtistModule),
      },
      {
        path: 'playlist',
        loadChildren: () =>
          import('../playlist/playlist.module').then((m) => m.PlaylistModule),
      },
      {
        path: 'likes',
        data: { animation: 'default' },
        component: PagePlaylistLikesComponent,
      },
      {
        path: 'play',
        loadChildren: () =>
          import('../player/player.module').then((m) => m.PlayerModule),
      },
    ],
  },
];

@NgModule({
  declarations: [MainComponent],
  imports: [
    RouterModule.forChild(routes),
    CoreModule,
    PlayerModule,
    DatabaseModule,
    ScannerModule,
    HelperModule,
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
export class MainModule {}
