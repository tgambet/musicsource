import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Song, SongWithCover } from '@app/models/song.model';
import { Icons } from '@app/utils/icons.util';
import { AudioService } from '@app/services/audio.service';
import { LibraryFacade } from '@app/store/library/library.facade';
import { concatMap, filter } from 'rxjs/operators';
import { Entry, FileEntry } from '@app/models/entry.model';

@Component({
  selector: 'app-song-list',
  template: `
    <div class="song" *ngFor="let song of songs; let i = index">
      <span class="cover">
        <img [src]="song.cover" alt="cover" height="32" />
        <app-player-button
          size="small"
          shape="square"
          (playClicked)="play(song)"
        ></app-player-button>
      </span>
      <span class="title">{{ song.title }}</span>
      <span class="artist">{{ song.artist }}</span>
      <span class="album">{{ song.album }}</span>
      <span class="controls">
        <button mat-icon-button>
          <app-icon [path]="icons.heartOutline"></app-icon>
        </button>
        <app-menu></app-menu>
      </span>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .song {
        display: flex;
        align-items: center;
        flex: 0 0 49px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 8px;
      }
      .song:last-of-type {
        border: none;
      }
      .cover {
        flex: 0 0 32px;
        margin-right: 24px;
        text-align: center;
        position: relative;
      }
      .cover app-player-button {
        position: absolute;
        top: -4px;
        left: -4px;
      }

      .title {
        flex: 12 1 0;
      }
      .artist,
      .album {
        color: #aaa;
        flex: 9 1 0;
      }
      .controls {
        flex: 0 0 auto;
        visibility: hidden;
      }
      .song:hover .controls {
        visibility: visible;
      }
      .controls button {
        margin-right: 8px;
      }
      app-player-button {
        visibility: hidden;
      }
      .song:hover app-player-button {
        visibility: visible;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongListComponent {
  @Input() songs!: SongWithCover[];

  icons = Icons;

  constructor(private library: LibraryFacade, private audio: AudioService) {}

  isFileEntry(entry: Entry | undefined): entry is FileEntry {
    return !!entry && entry.kind === 'file';
  }

  play(song: Song) {
    this.library
      .getEntry(song.entryPath)
      .pipe(
        filter(this.isFileEntry),
        concatMap((entry) =>
          this.library.requestPermission(entry.handle).pipe(
            concatMap(() => entry.handle.getFile()),
            concatMap((file) => this.audio.play(file))
          )
        )
      )
      .subscribe();
  }
}
