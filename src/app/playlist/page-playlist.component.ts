import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Playlist, PlaylistId } from '@app/database/playlists/playlist.model';
import { EMPTY, Observable, of, switchMap } from 'rxjs';
import { Song } from '@app/database/songs/song.model';
import { ActivatedRoute } from '@angular/router';
import { Icons } from '@app/core/utils/icons.util';
import { PlayerFacade } from '@app/player/store/player.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { HelperFacade } from '@app/helper/helper.facade';
import { filter, map } from 'rxjs/operators';
import { MenuItem } from '@app/core/components/menu.component';

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
              <ng-container *ngIf="songs.length > 0">
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
                  (click)="shufflePlay(playlist)"
                >
                  <app-icon [path]="icons.shuffle"></app-icon>
                  <span>Shuffle</span>
                </button>
                <button
                  mat-stroked-button
                  class="shuffle-button"
                  color="accent"
                  (click)="toggleLiked(playlist)"
                >
                  <app-icon
                    [path]="
                      !!playlist.likedOn ? icons.heart : icons.heartOutline
                    "
                  ></app-icon>
                  <span>{{
                    !!playlist.likedOn
                      ? 'Remove from your likes'
                      : 'Add to your likes'
                  }}</span>
                </button>
                <app-menu
                  [disableRipple]="true"
                  [menuItems]="menuItems$ | async"
                ></app-menu>
              </ng-container>
            </ng-container>
          </div>
        </app-container-page>
      </header>
      <app-container-page>
        <ng-container *ngIf="songs$ | async as songs">
          <app-song-list [songs]="songs"></app-song-list>
          <p class="empty" *ngIf="songs.length === 0">
            No songs in this playlist yet
          </p>
        </ng-container>
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
  menuItems$!: Observable<MenuItem[]>;

  icons = Icons;

  constructor(
    private route: ActivatedRoute,
    private player: PlayerFacade,
    private pictures: PictureFacade,
    private playlists: PlaylistFacade,
    private songs: SongFacade,
    private helper: HelperFacade
  ) {}

  ngOnInit(): void {
    const playlistKey = this.route.snapshot.data.info as PlaylistId;

    this.playlist$ = this.playlists
      .getByKey(playlistKey)
      .pipe(filter((playlist): playlist is Playlist => !!playlist));

    this.cover$ = this.playlist$.pipe(
      switchMap(() => EMPTY) // TODO this.pictures.getCover(playlist.pictureKey))
    );

    this.color$ = of('red');

    this.songs$ = this.playlist$.pipe(
      switchMap((playlist) => this.songs.getByKeys(playlist.songs))
    );

    this.menuItems$ = this.playlist$.pipe(
      map((playlist) => [
        {
          text: 'Play next',
          icon: this.icons.playlistPlay,
          click: () => this.helper.addPlaylistToQueue(playlist.id, true),
        },
        {
          text: 'Add to queue',
          icon: this.icons.playlistMusic,
          click: () => this.helper.addPlaylistToQueue(playlist.id),
        },
        {
          text: 'Add to playlist',
          icon: this.icons.playlistPlus,
          click: () => this.helper.addPlaylistToPlaylist(playlist.id),
        },
        {
          text: 'Edit playlist',
          icon: this.icons.playlistEdit,
          click: () => this.helper.editPlaylist(playlist.id),
        },
        {
          text: 'Delete playlist',
          icon: this.icons.delete,
          click: () => this.helper.deletePlaylist(playlist.id),
        },
      ])
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

  shufflePlay(playlist: Playlist): void {
    this.helper.playPlaylist(playlist.id, true);
  }

  toggleLiked(playlist: Playlist): void {
    this.playlists.toggleLiked(playlist);
  }
}
