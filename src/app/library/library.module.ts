import { NgModule } from '@angular/core';
import { LibraryComponent } from '@app/library/library.component';
import { LibraryAlbumsComponent } from '@app/library/library-albums.component';
import { LibraryArtistsComponent } from '@app/library/library-artists.component';
import { LibraryContentComponent } from '@app/library/library-content.component';
import { LibraryPlaylistsComponent } from '@app/library/library-playlists.component';
import { LibrarySongsComponent } from '@app/library/library-songs.component';
import { CoreModule } from '@app/core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { LibraryLikesComponent } from '@app/library/library-likes.component';
import { RouterComponent } from '@app/core/components/router.component';

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
      {
        path: 'likes',
        component: RouterComponent,
        children: [
          { path: '', redirectTo: 'all', pathMatch: 'full' },
          { path: ':type', component: LibraryLikesComponent },
        ],
      },
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
    LibraryLikesComponent,
  ],
  imports: [CoreModule, RouterModule.forChild(routes)],
})
export class LibraryModule {}
