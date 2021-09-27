import { NgModule } from '@angular/core';
import { PageArtistComponent } from '@app/artist/page-artist.component';
import { CoreModule } from '@app/core/core.module';
import { RouterModule, Routes } from '@angular/router';
import { PageArtistResolverService } from '@app/artist/page-artist-resolver.service';

const routes: Routes = [
  {
    path: ':id',
    component: PageArtistComponent,
    data: { animation: 'default' },
    resolve: { info: PageArtistResolverService },
  },
];

@NgModule({
  declarations: [PageArtistComponent],
  imports: [CoreModule, RouterModule.forChild(routes)],
  providers: [PageArtistResolverService],
})
export class ArtistModule {}
