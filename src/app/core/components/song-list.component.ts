import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Song, SongId } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';

@Component({
  selector: 'app-song-list',
  template: `
    <app-song-list-item
      *ngFor="let song of songs; trackBy: trackBy"
      [song]="song"
      [queue]="getIds(songs)"
      cdkMonitorSubtreeFocus
      [class.selected]="(currentSongPath$ | async) === song.id"
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

  currentSongPath$ = this.player.getCurrentSong$();

  constructor(private player: PlayerFacade) {}

  trackBy(index: number, song: Song): string {
    return song.id;
  }

  getIds(songs: Song[]): SongId[] {
    return songs.map((s) => s.id);
  }
}
