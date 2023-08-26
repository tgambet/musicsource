import { NgModule } from '@angular/core';

import { MainComponent } from './main.component';
import { MAT_LEGACY_SNACK_BAR_DEFAULT_OPTIONS as MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/legacy-snack-bar';
import { CoreModule } from '@app/core/core.module';
import { PlayerModule } from '@app/player/player.module';
import { RouterModule, Routes } from '@angular/router';
import { MainGuard } from '@app/main/main.guard';
import { ScrollerService } from '@app/main/scroller.service';
import { DatabaseModule } from '@app/database/database.module';
import { ScannerModule } from '@app/scanner/scanner.module';
import { HelperModule } from '@app/helper/helper.module';
import { NavigationService } from '@app/main/navigation.service';
import { AudioService } from '@app/player/audio.service';

const routes: Routes = [
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
        // canActivate: [MainGuard],
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
    NavigationService,
    AudioService,
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
