import { NgModule } from '@angular/core';
import { PageAlbumComponent } from '@app/album/page-album.component';
import { CoreModule } from '@app/core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { PageAlbumResolverService } from '@app/album/page-album-resolver.service';

const routes: Routes = [
  {
    path: ':id',
    component: PageAlbumComponent,
    data: { animation: 'default' },
    resolve: { info: PageAlbumResolverService },
  },
];

@NgModule({
  declarations: [PageAlbumComponent],
  imports: [CoreModule, RouterModule.forChild(routes)],
  providers: [PageAlbumResolverService],
})
export class AlbumModule {}
