import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Song } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-song-list',
  template: `
    <app-song-list-item
      *ngFor="let song of songs; trackBy: trackBy"
      [song]="song"
      [playlist]="songs"
      cdkMonitorSubtreeFocus
      [class.selected]="(currentSongPath$ | async) === song.entryPath"
    ></app-song-list-item>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      app-song-list-item {
        flex: 0 0 48px;
      }
      app-song-list-item:last-of-type {
        border: none;
      }
      app-song-list-item.selected {
        background-color: rgba(255, 255, 255, 0.1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongListComponent {
  @Input() songs!: Song[];

  icons = Icons;

  currentSongPath$ = this.player
    .getCurrentSong$()
    .pipe(map((entryPath) => entryPath));

  constructor(private player: PlayerFacade) {}

  trackBy(index: number, song: Song): string {
    return song.entryPath;
  }
}
