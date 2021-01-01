import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Song, SongWithCover$ } from '@app/models/song.model';
import { Observable } from 'rxjs';
import { LibraryFacade } from '@app/store/library/library.facade';
import { map, scan, shareReplay, startWith } from 'rxjs/operators';
import { Icons } from '@app/utils/icons.util';

@Component({
  selector: 'app-page-playlist-likes',
  template: `
    <header (click)="songList.closeMenu()">
      <app-container-page class="header-container">
        <div class="info">
          <div class="cover" style="--aspect-ratio:1">
            <app-icon-likes [fullWidth]="true"></app-icon-likes>
          </div>
          <div class="metadata">
            <app-title [title]="'Your Likes'"></app-title>
            <p>
              <span>Auto playlist</span>
            </p>
            <p class="stats" *ngIf="songs$ | async as songs">
              {{ songs.length }} songs • {{ getLength(songs) }} minutes
            </p>
            <p class="description">
              All the music you liked in MusicSource appears here.
            </p>
          </div>
        </div>
        <div class="actions">
          <ng-container *ngIf="songs$ | async as songs">
            <button
              mat-raised-button
              class="play-button"
              color="accent"
              [disabled]="songs.length === 0"
            >
              <app-icon [path]="icons.shuffle"></app-icon>
              <span>Shuffle</span>
            </button>
          </ng-container>
          <app-menu [disableRipple]="true"></app-menu>
        </div>
      </app-container-page>
    </header>
    <app-container-page>
      <app-song-list [songs]="songs$ | async" #songList></app-song-list>
      <p class="empty" *ngIf="(songs$ | async)?.length === 0">
        No liked songs yet.
      </p>
    </app-container-page>
  `,
  styleUrls: ['../styles/page-header.component.scss'],
  styles: [
    `
      :host {
        display: block;
      }
      .cover {
        background-color: #f88dae;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePlaylistLikesComponent implements OnInit {
  songs$!: Observable<SongWithCover$[]>;

  icons = Icons;

  constructor(private library: LibraryFacade) {}

  ngOnInit(): void {
    this.songs$ = this.library.getSongs('likedOn', undefined, 'prev').pipe(
      map(({ value }) => value),
      scan((acc, cur) => [...acc, cur], [] as SongWithCover$[]),
      startWith([]),
      shareReplay(1)
    );
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }
}
