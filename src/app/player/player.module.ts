import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { PlayComponent } from '@app/player/play.component';
import { PlayerComponent } from '@app/player/player.component';
import { PlaylistListComponent } from '@app/player/playlist-list.component';
import { PlaylistListItemComponent } from '@app/player/playlist-list-item.component';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { PlayerEffects } from '@app/player/store/player.effects';

const routes: Routes = [
  {
    path: '',
    component: PlayComponent,
    data: { animation: 'PlayPage' },
  },
];

@NgModule({
  declarations: [
    PlayComponent,
    PlayerComponent,
    PlaylistListComponent,
    PlaylistListItemComponent,
  ],
  imports: [
    CoreModule,
    RouterModule.forChild(routes),
    EffectsModule.forFeature([PlayerEffects]),
  ],
  exports: [PlayerComponent],
})
export class PlayerModule {}
