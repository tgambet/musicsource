import { NgModule } from '@angular/core';
import { CoreModule } from '@app/core/core.module';
import { PlayComponent } from '@app/player/play.component';
import { PlayerComponent } from '@app/player/player.component';
import { QueueListComponent } from '@app/player/queue-list.component';
import { QueueItemComponent } from '@app/player/queue-item.component';
import { RouterModule, Routes } from '@angular/router';
import { EffectsModule } from '@ngrx/effects';
import { PlayerEffects } from '@app/player/store/player.effects';
import { StoreModule } from '@ngrx/store';
import { playerReducer } from '@app/player/store/player.reducer';
import { PlayerFacade } from '@app/player/store/player.facade';
import { MediaSessionService } from '@app/player/media-session.service';
import { AnalyzerService } from '@app/player/analyzer.service';

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
    QueueListComponent,
    QueueItemComponent,
  ],
  imports: [
    CoreModule,
    RouterModule.forChild(routes),
    StoreModule.forFeature('player', playerReducer),
    EffectsModule.forFeature([PlayerEffects]),
  ],
  providers: [PlayerFacade, MediaSessionService, AnalyzerService],
  exports: [PlayerComponent],
})
export class PlayerModule {}
