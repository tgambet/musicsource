import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
} from '@angular/core';
import { Song } from '@app/database/songs/song.model';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { map } from 'rxjs/operators';
import { WithTrigger } from '@app/core/classes/with-trigger';

@Component({
  selector: 'app-song-list',
  template: `
    <app-song-list-item
      *ngFor="let song of songs; trackBy: trackBy"
      [song]="song"
      [playlist]="songs"
      cdkMonitorSubtreeFocus
      (menuOpened)="menuOpened($event)"
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
export class SongListComponent extends WithTrigger {
  @Input() songs!: Song[];

  icons = Icons;

  currentSongPath$ = this.player
    .getCurrentSong$()
    .pipe(map((song) => song?.entryPath));

  constructor(private player: PlayerFacade) {
    super();
  }

  @HostListener('window:scroll')
  @HostListener('click')
  closeMenu(): void {
    super.closeMenu();
  }

  trackBy(index: number, song: Song): string {
    return song.entryPath;
  }
}
