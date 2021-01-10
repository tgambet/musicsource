import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { SongWithCover$ } from '@app/models/song.model';

@Component({
  selector: 'app-track-list-item',
  template: `
    <!--<div class="song" *ngFor="let song of songs; let i = index">-->
    <span class="index">
      <span>{{ trackNumber }}</span>
      <app-player-button
        size="small"
        shape="square"
        (playClicked)="playClicked.emit()"
      ></app-player-button>
    </span>
    <span class="title">{{ song.title }}</span>
    <span class="duration">{{ song.duration | duration }}</span>
    <!--</div>-->
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        flex: 0 0 58px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 8px;
      }
      :host:last-of-type {
        border: none;
      }
      .index {
        color: #aaa;
        flex: 0 0 32px;
        line-height: 32px;
        margin-right: 24px;
        text-align: center;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
      }
      .index app-player-button {
        color: white;
        position: absolute;
        top: -4px;
        left: -4px;
      }
      app-player-button,
      :host:hover .index span {
        visibility: hidden;
      }
      :host:hover app-player-button {
        visibility: visible;
      }
      .title {
        flex: 1 1 auto;
      }
      .duration {
        color: #aaa;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackListItemComponent {
  @Input() song!: SongWithCover$;
  @Input() trackNumber!: number;
  @Input() albumHash!: string;

  @Output() playClicked = new EventEmitter<void>();
  // @Input() songs!: Song[];

  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  // rootEntry?: DirectoryEntry;

  constructor() {}

  // isFileEntry(entry: Entry | undefined): entry is FileEntry {
  //   return !!entry && entry.kind === 'file';
  // }
  //
  // isDirectoryEntry(entry: Entry | undefined): entry is DirectoryEntry {
  //   return !!entry && entry.kind === 'directory';
  // }
  //
  // play(song: Song) {
  //   this.library
  //     .getRootEntry()
  //     .pipe(
  //       filter(this.isDirectoryEntry),
  //       tap((root) => (this.rootEntry = root))
  //     )
  //     .subscribe();
  //
  //   this.library
  //     .getEntry(song.entryPath)
  //     .pipe(
  //       filter(this.isFileEntry),
  //       concatMap((entry) =>
  //         this.library.requestPermission(entry.handle).pipe(
  //           concatMap(() => entry.handle.getFile()),
  //           concatMap((file) => this.audio.setSrc(file))
  //         )
  //       )
  //     )
  //     .subscribe();
  // }
}
