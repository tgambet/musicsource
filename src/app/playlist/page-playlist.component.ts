import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Playlist } from '@app/database/playlists/playlist.model';
import { from, Observable, of } from 'rxjs';
import { Song, SongWithCover$ } from '@app/database/songs/song.model';
import { ActivatedRoute } from '@angular/router';
import { concatMap, map, shareReplay, switchMap } from 'rxjs/operators';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';

export interface PagePlaylistData {
  playlist: Playlist;
  cover: string | undefined;
  songs$: Observable<SongWithCover$[]>;
}

@Component({
  selector: 'app-playlist-page',
  template: `
    <ng-container *ngIf="info$ | async as info">
      <header>
        <app-container-page class="header-container">
          <div class="info">
            <div class="cover" style="--aspect-ratio:1">
              <ng-container *ngIf="info.cover; else icon">
                <ng-container *ngIf="color$ | async as color">
                  <img [src]="info.cover" alt="cover" />
                  <div class="inner-cover" [style.backgroundColor]="color">
                    <img [src]="info.cover" alt="cover" />
                  </div>
                </ng-container>
              </ng-container>
              <ng-template #icon>
                <app-icon [path]="icons.playlistPlay" [size]="144"></app-icon>
              </ng-template>
            </div>
            <div class="metadata">
              <app-title>{{ info.playlist.title }}</app-title>
              <p>
                <span>Playlist</span> • <span>{{ '2020' }}</span>
              </p>
              <p class="stats" *ngIf="songs$ | async as songs">
                {{ songs.length }} songs • {{ getLength(songs) }} minutes
              </p>
              <p class="description" *ngIf="info.playlist.description">
                {{ info.playlist.description }}
              </p>
            </div>
          </div>
          <div class="actions">
            <ng-container *ngIf="songs$ | async as songs">
              <!--              <button
                mat-stroked-button
                color="accent"
                *ngIf="songs.length === 0"
              >
                <app-icon [path]="icons.playlistEdit"></app-icon>
                <span>Edit playlist</span>
              </button>-->
              <button
                mat-raised-button
                class="play-button"
                color="accent"
                *ngIf="songs.length > 0"
                (click)="shufflePlay(songs)"
              >
                <app-icon [path]="icons.shuffle"></app-icon>
                <span>Shuffle</span>
              </button>
              <button
                mat-stroked-button
                class="shuffle-button"
                color="accent"
                *ngIf="songs.length > 0"
              >
                <app-icon [path]="icons.heartOutline"></app-icon>
                <span>Add to your likes</span>
              </button>
            </ng-container>
            <!--<app-menu [disableRipple]="true"></app-menu>-->
          </div>
        </app-container-page>
      </header>
      <app-container-page>
        <app-song-list
          [songs]="songs"
          *ngIf="songs$ | async as songs"
        ></app-song-list>
        <p class="empty" *ngIf="(songs$ | async)?.length === 0">
          No songs in this playlist yet
        </p>
      </app-container-page>
    </ng-container>
  `,
  styleUrls: ['../core/styles/page-header.component.scss'],
  styles: [
    `
      .cover {
        background-color: #4f4f4f;
      }
      .cover app-icon {
        color: rgba(0, 0, 0, 0.2);
      }
      .inner-cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 16.6%;
      }
      img {
        width: 100%;
        height: auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePlaylistComponent implements OnInit {
  info$!: Observable<PagePlaylistData>;

  songs$!: Observable<SongWithCover$[]>;
  color$!: Observable<string | undefined>;

  icons = Icons;

  constructor(private route: ActivatedRoute, private player: PlayerFacade) {}

  ngOnInit(): void {
    this.info$ = this.route.data.pipe(map((data) => data.info));
    this.songs$ = this.info$.pipe(
      switchMap(({ songs$ }) => songs$),
      shareReplay(1)
    );
    this.color$ = this.info$.pipe(
      switchMap(({ cover }) =>
        !cover
          ? of(undefined)
          : from(import('node-vibrant')).pipe(
              concatMap((vibrant) => vibrant.default.from(cover).getPalette()),
              map((palette) => palette.Vibrant?.getRgb()),
              map((rgb) =>
                !!rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)` : undefined
              )
            )
      )
    );
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }

  shufflePlay(songs: SongWithCover$[]): void {
    this.player.setPlaying();
    this.player.setPlaylist(songs);
    this.player.shuffle();
    this.player.show();
  }
}
