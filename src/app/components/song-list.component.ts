import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
} from '@angular/core';
import { SongWithCover$ } from '@app/models/song.model';
import { Icons } from '@app/utils/icons.util';
import { MatMenuTrigger } from '@angular/material/menu';
import { PlayerFacade } from '@app/store/player/player.facade';
import { map } from 'rxjs/operators';

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
export class SongListComponent {
  @Input() songs!: SongWithCover$[];

  icons = Icons;

  trigger?: MatMenuTrigger;

  currentSongPath$ = this.player
    .getCurrentSong$()
    .pipe(map((song) => song?.entryPath));

  constructor(private player: PlayerFacade) {}

  @HostListener('window:scroll')
  @HostListener('click')
  closeMenu() {
    if (this.trigger) {
      this.trigger.closeMenu();
      this.trigger = undefined;
    }
  }

  menuOpened(trigger: MatMenuTrigger) {
    if (this.trigger && this.trigger !== trigger) {
      this.trigger.closeMenu();
    }
    this.trigger = trigger;
  }

  trackBy(index: number, song: SongWithCover$): string {
    return song.entryPath;
  }
}
