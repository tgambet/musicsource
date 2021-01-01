import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { hash } from '@app/utils/hash.util';
import { Icons } from '@app/utils/icons.util';
import { concatMap, tap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { LibraryFacade } from '@app/store/library/library.facade';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlaylistAddComponent } from '@app/dialogs/playlist-add.component';

@Component({
  selector: 'app-song-list-item',
  template: `
    <div class="cover" style="--aspect-ratio:1">
      <img *ngIf="song.cover$ | async as cover" [src]="cover" alt="cover" />
      <app-player-button size="small" shape="square"></app-player-button>
    </div>
    <span class="title">{{ song.title }}</span>
    <span class="artists">
      <ng-container *ngFor="let artist of song.artists; let last = last">
        <a [routerLink]="['/', 'artist', getHash(artist)]">{{ artist }}</a>
        <span>{{ !last ? ', ' : '' }}</span>
      </ng-container>
    </span>
    <span class="album">
      <a [routerLink]="['/', 'album', getHash(song.album)]" *ngIf="song.album">
        {{ song.album }}
      </a>
    </span>
    <span class="controls">
      <button
        [class.liked]="!!song.likedOn"
        mat-icon-button
        [disableRipple]="true"
        (click)="toggleFavorite(song)"
      >
        <app-icon
          [path]="!!song.likedOn ? icons.heart : icons.heartOutline"
        ></app-icon>
      </button>
      <button
        class="trigger"
        aria-label="Other actions"
        title="Other actions"
        mat-icon-button
        [disableRipple]="true"
        #trigger="matMenuTrigger"
        [matMenuTriggerFor]="menu"
        [matMenuTriggerData]="{ song: song }"
        (click)="menuOpened.emit(trigger); $event.stopPropagation()"
      >
        <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
      </button>
    </span>
    <span class="duration">{{ song.duration | duration }}</span>
    <mat-menu #menu="matMenu" [hasBackdrop]="false" [overlapTrigger]="false">
      <ng-template matMenuContent>
        <button mat-menu-item>
          <app-icon [path]="icons.radio"></app-icon>
          <span>Start radio</span>
        </button>
        <button mat-menu-item>
          <app-icon [path]="icons.playlistPlay"></app-icon>
          <span>Play next</span>
        </button>
        <button mat-menu-item>
          <app-icon [path]="icons.playlistMusic"></app-icon>
          <span>Add to queue</span>
        </button>
        <button mat-menu-item (click)="addSongToPlaylist(song)">
          <app-icon [path]="icons.playlistPlus"></app-icon>
          <span>Add to playlist</span>
        </button>
        <button
          mat-menu-item
          [routerLink]="['/', 'album', getHash(song.album)]"
          *ngIf="song.album"
        >
          <app-icon [path]="icons.album"></app-icon>
          <span>Go to album</span>
        </button>
        <button
          mat-menu-item
          [routerLink]="['/', 'artist', getHash(song.artist)]"
          *ngIf="song.artist"
        >
          <app-icon [path]="icons.accountMusic"></app-icon>
          <span>Go to artist</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        padding: 0 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .cover {
        width: 32px;
        margin-right: 16px;
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }
      .cover app-player-button {
        position: absolute;
        top: -4px;
        left: -4px;
        opacity: 0;
      }
      .title {
        flex: 12 1 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 8px;
      }
      .artists {
        margin-right: 8px;
      }
      .artists,
      .album {
        color: #aaa;
        flex: 9 1 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .duration {
        color: #aaa;
        flex: 0 0 54px;
        margin-left: 16px;
        text-align: right;
      }
      .controls {
        flex: 0 0 auto;
        margin-left: 16px;
        color: #aaa;
      }
      .controls button:not(.liked) {
        opacity: 0;
      }
      :host:hover .controls button,
      :host.cdk-focused .controls button,
      :host:hover app-player-button,
      :host.cdk-focused app-player-button {
        opacity: 1;
      }
      .controls button:not(:last-of-type) {
        margin-right: 8px;
      }
      a[href] {
        text-decoration: none;
      }
      a[href]:hover {
        text-decoration: underline;
      }
      .mat-menu-item app-icon {
        margin-right: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongListItemComponent implements OnInit {
  @Input() song!: SongWithCover$;
  @Output() menuOpened = new EventEmitter<MatMenuTrigger>();

  icons = Icons;

  constructor(
    private dialog: MatDialog,
    private library: LibraryFacade,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  getHash(s: string): string {
    return hash(s);
  }

  addSongToPlaylist(song: Song) {
    const ref = this.dialog.open(PlaylistAddComponent, {
      width: '275px',
      maxHeight: '80%',
      height: 'auto',
      panelClass: 'playlists-dialog',
    });

    ref
      .afterClosed()
      .pipe(
        concatMap(
          (result) =>
            result === undefined
              ? EMPTY
              : result === true
              ? EMPTY // Redirect to new playlist
              : this.library
                  .addSongToPlaylist(song, result)
                  .pipe(
                    tap((key) => this.snack.open(`Added to ${key}`, 'VIEW'))
                  ) // TODO redirect to playlist
        )
      )
      .subscribe();
  }

  toggleFavorite(song: Song) {
    this.library
      .toggleSongFavorite(song)
      .pipe(tap(() => (song.likedOn = !!song.likedOn ? undefined : new Date())))
      .pipe(
        tap(() =>
          this.snack.open(
            !!song.likedOn ? 'Added to your likes' : 'Removed from your likes',
            undefined
          )
        ),
        tap(() => this.cdr.markForCheck())
      )
      .subscribe();
  }
}
