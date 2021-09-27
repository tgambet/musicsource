import { NgModule } from '@angular/core';
import { LibraryComponent } from '@app/library/library.component';
import { LibraryAlbumsComponent } from '@app/library/library-albums.component';
import { LibraryArtistsComponent } from '@app/library/library-artists.component';
import { LibraryContentComponent } from '@app/library/library-content.component';
import { LibraryPlaylistsComponent } from '@app/library/library-playlists.component';
import { LibrarySongsComponent } from '@app/library/library-songs.component';
import { CoreModule } from '@app/core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { LibraryEffects } from '@app/library/store';

const routes: Routes = [
  {
    path: '',
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
];

@NgModule({
  declarations: [
    LibraryComponent,
    LibraryAlbumsComponent,
    LibraryArtistsComponent,
    LibraryContentComponent,
    LibraryPlaylistsComponent,
    LibrarySongsComponent,
  ],
  imports: [
    CoreModule,
    RouterModule.forChild(routes),
    EffectsModule.forFeature([LibraryEffects]),
  ],
})
export class LibraryModule {}
