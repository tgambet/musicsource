import { NgModule } from '@angular/core';
import { PagePlaylistComponent } from '@app/playlist/page-playlist.component';
import { PagePlaylistLikesComponent } from '@app/playlist/page-playlist-likes.component';
import { CoreModule } from '@app/core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { PagePlaylistResolver } from '@app/playlist/page-playlist-resolver.service';

const routes: Routes = [
  {
    path: ':id',
    component: PagePlaylistComponent,
    data: { animation: 'default' },
    resolve: { info: PagePlaylistResolver },
  },
];

@NgModule({
  declarations: [PagePlaylistComponent, PagePlaylistLikesComponent],
  imports: [CoreModule, RouterModule.forChild(routes)],
})
export class PlaylistModule {}
