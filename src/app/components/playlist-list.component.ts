import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  HostListener,
} from '@angular/core';
import { SongWithCover$ } from '@app/models/song.model';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-playlist-list',
  template: `
    <app-playlist-list-item
      cdkMonitorSubtreeFocus
      *ngFor="let song of playlist; trackBy: trackBy; let i = index"
      [song]="song"
      [playlist]="playlist"
      (menuOpened)="menuOpened($event)"
      [class.selected]="song.entryPath === currentSong?.entryPath"
    ></app-playlist-list-item>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      app-playlist-list-item {
        flex: 0 0 56px;
      }
      app-playlist-list-item.selected {
        background-color: rgba(255, 255, 255, 0.1);
      }
      app-playlist-list-item:last-of-type {
        border: none;
      }
      :host::-webkit-scrollbar-track {
        background-color: #000;
        border-left: none;
      }
      :host::-webkit-scrollbar-thumb {
        background-color: black;
      }
      :host:hover::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.24);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistListComponent implements OnInit {
  @Input() playlist!: SongWithCover$[];
  @Input() currentSong?: SongWithCover$ | null;

  trigger?: MatMenuTrigger;

  constructor() {}

  @HostListener('scroll')
  @HostListener('click')
  closeMenu() {
    if (this.trigger) {
      this.trigger.closeMenu();
      this.trigger = undefined;
    }
  }

  ngOnInit(): void {}

  menuOpened(trigger: MatMenuTrigger) {
    if (this.trigger && this.trigger !== trigger) {
      this.trigger.closeMenu();
    }
    this.trigger = trigger;
  }

  trackBy(index: number, song: SongWithCover$) {
    return song.entryPath;
  }
}
