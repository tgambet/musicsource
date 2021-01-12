import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
} from '@angular/core';
import { SongWithCover$ } from '@app/models/song.model';
import { Icons } from '@app/utils/icons.util';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-song-list',
  template: `
    <app-song-list-item
      *ngFor="let song of songs; trackBy: trackBy"
      [song]="song"
      cdkMonitorSubtreeFocus
      (menuOpened)="menuOpened($event)"
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongListComponent {
  @Input() songs!: SongWithCover$[] | null;

  icons = Icons;

  trigger?: MatMenuTrigger;

  // https://bugs.chromium.org/p/chromium/issues/detail?id=1146886&q=component%3ABlink%3EStorage%3EFileSystem&can=2
  // rootEntry?: DirectoryEntry;

  constructor() {}

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
  //           concatMap((file) => this.audio.play(file))
  //         )
  //       )
  //     )
  //     .subscribe();
  // }
}
