import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Song } from '@app/database/songs/song.model';

@Component({
  selector: 'app-playlist-list',
  template: `
    <app-playlist-list-item
      class="item"
      cdkDrag
      cdkMonitorSubtreeFocus
      *ngFor="let song of playlist; trackBy: trackBy; let i = index"
      [song]="song"
      [playlist]="playlist"
      [class.selected]="
        song.entryPath === currentSong?.entryPath && currentIndex === i
      "
    ></app-playlist-list-item>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .item {
        flex: 0 0 56px;
        box-sizing: border-box;
        background-color: black;
      }
      .item.selected {
        background-color: #1a1a1a;
      }
      .item:last-of-type {
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
      .cdk-drag-preview {
        background-color: #1a1a1a;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      }
      .cdk-drag-placeholder {
        opacity: 0;
      }
      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      :host.cdk-drop-list-dragging .item:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistListComponent {
  @Input() playlist!: Song[];
  @Input() currentSong!: Song | null;
  @Input() currentIndex!: number | null;

  trackBy(index: number, song: Song): string {
    return song.entryPath;
  }
}
