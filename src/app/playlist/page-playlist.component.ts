import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Playlist, PlaylistId } from '@app/database/playlists/playlist.model';
import { Observable, of, switchMap } from 'rxjs';
import { Song } from '@app/database/songs/song.model';
import { ActivatedRoute } from '@angular/router';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';

@Component({
  selector: 'app-playlist-page',
  template: `
    <ng-container *ngIf="playlist$ | async as playlist">
      <header>
        <app-container-page class="header-container">
          <div class="info">
            <div class="cover" style="--aspect-ratio:1">
              <ng-container *ngIf="cover$ | async as cover; else icon">
                <ng-container *ngIf="color$ | async as color">
                  <img [src]="cover" alt="cover" />
                  <div class="inner-cover" [style.backgroundColor]="color">
                    <img [src]="cover" alt="cover" />
                  </div>
                </ng-container>
              </ng-container>
              <ng-template #icon>
                <app-icon [path]="icons.playlistPlay" [size]="144"></app-icon>
              </ng-template>
            </div>
            <div class="metadata">
              <app-title>{{ playlist.title }}</app-title>
              <p>
                <span>Playlist</span> • <span>{{ '2020' }}</span>
              </p>
              <p class="stats" *ngIf="songs$ | async as songs">
                {{ songs.length }} songs • {{ getLength(songs) }} minutes
              </p>
              <p class="description" *ngIf="playlist.description">
                {{ playlist.description }}
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
  playlist$!: Observable<Playlist>;
  cover$!: Observable<string | undefined>;
  color$!: Observable<string>;
  songs$!: Observable<Song[]>;

  icons = Icons;

  constructor(
    private route: ActivatedRoute,
    private player: PlayerFacade,
    private pictures: PictureFacade,
    private playlists: PlaylistFacade,
    private songs: SongFacade
  ) {}

  ngOnInit(): void {
    const playlistKey = this.route.snapshot.data.info as PlaylistId;

    this.playlist$ = this.playlists.getByKey(
      playlistKey
    ) as Observable<Playlist>;

    this.cover$ = this.playlist$.pipe(
      switchMap((playlist) => this.pictures.getCover(playlist.pictureKey))
    );

    this.color$ = of('red');

    this.songs$ = this.playlist$.pipe(
      switchMap((playlist) => this.songs.getByKeys(playlist.songs))
    );

    // this.songs$ = this.info$.pipe(
    //   switchMap(({ songs$ }) => songs$),
    //   shareReplay(1)
    // );
    // this.color$ = this.info$.pipe(
    //   switchMap(({ cover }) =>
    //     !cover
    //       ? of(undefined)
    //       : from(import('node-vibrant')).pipe(
    //           concatMap((vibrant) => vibrant.default.from(cover).getPalette()),
    //           map((palette) => palette.Vibrant?.getRgb()),
    //           map((rgb) =>
    //             !!rgb ? `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)` : undefined
    //           )
    //         )
    //   )
    // );
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }

  shufflePlay(songs: Song[]): void {
    this.player.setPlaying();
    this.player.setQueue(songs.map((s) => s.entryPath));
    this.player.shuffle();
    this.player.show();
  }
}
