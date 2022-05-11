import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Icons } from '@app/core/utils';
import { Playlist } from '@app/database/playlists/playlist.model';
import { Observable, of } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { MenuItem } from '@app/core/components/menu.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerFacade } from '@app/player/store/player.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { HelperFacade } from '@app/helper/helper.facade';
import { SongId } from '@app/database/songs/song.model';

@Component({
  selector: 'app-playlist',
  template: `
    <app-cover
      [title]="playlist.title"
      [menuItems]="menuItems$ | async"
      [coverRouterLink]="['/', 'playlist', playlist.id]"
      [queue]="songs$ | async"
    >
      <ng-container *ngIf="cover$ | async as cover; else icon">
        <ng-container *ngIf="color$ | async as color">
          <img [src]="cover" alt="cover" />
          <div class="inner-cover" [style.backgroundColor]="color">
            <img [src]="cover" alt="cover" />
          </div>
          <app-icon class="icon-cover" [path]="icons.playlistMusic"></app-icon>
        </ng-container>
      </ng-container>
      <ng-template #icon>
        <app-icon
          class="icon-replace"
          [path]="icons.playlistPlay"
          [size]="72"
        ></app-icon>
      </ng-template>
    </app-cover>
    <app-label
      [topLabel]="{
        text: playlist.title,
        routerLink: ['/', 'playlist', playlist.id]
      }"
      [bottomLabel]="playlist.songs.length + ' songs'"
      size="small"
    ></app-label>
  `,
  styles: [
    `
      :host,
      img {
        display: block;
      }
      app-cover {
        margin-bottom: 16px;
        background-color: #4f4f4f;
      }
      .icon-replace {
        color: rgba(0, 0, 0, 0.2);
      }
      img {
        width: 100%;
        height: auto;
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
      .icon-cover {
        position: absolute;
        left: 50%;
        bottom: 1px;
        transform: translateX(-50%);
        opacity: 0.66;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistComponent implements OnInit {
  @Input() playlist!: Playlist;

  icons = Icons;

  menuItems$!: Observable<MenuItem[]>;

  cover$!: Observable<string | undefined>;

  color$!: Observable<any>;

  songs$!: Observable<SongId[]>;

  constructor(
    // private library: LibraryFacade,
    private playlists: PlaylistFacade,
    private songs: SongFacade,
    private pictures: PictureFacade,
    private snack: MatSnackBar,
    private player: PlayerFacade,
    private helper: HelperFacade
  ) {}

  ngOnInit(): void {
    this.cover$ = this.pictures.getPlaylistCover(this.playlist, 160);

    // TODO
    this.color$ = of('rgba(0,0,0,0.66)');

    this.menuItems$ = this.playlists.getByKey(this.playlist.id).pipe(
      filter((playlist): playlist is Playlist => !!playlist),
      map((playlist) => [
        {
          icon: Icons.shuffle,
          text: 'Shuffle play',
          click: () => this.helper.playPlaylist(playlist.id, true),
          disabled: playlist.songs.length === 0,
        },
        // {
        //   icon: Icons.radio,
        //   text: 'Start radio',
        // },
        {
          icon: Icons.playlistPlay,
          text: 'Play next',
          click: () => this.helper.addPlaylistToQueue(playlist.id, true),
          disabled: playlist.songs.length === 0,
        },
        {
          icon: Icons.playlistMusic,
          text: 'Add to queue',
          click: () => this.helper.addPlaylistToQueue(playlist.id, false),
          disabled: playlist.songs.length === 0,
        },
        {
          icon: playlist.likedOn ? Icons.heart : Icons.heartOutline,
          text: playlist.likedOn
            ? 'Remove from your likes'
            : 'Add to your likes',
          click: () => this.playlists.toggleLiked(playlist),
        },
        {
          icon: Icons.playlistPlus,
          text: 'Add to playlist',
          click: () => this.helper.addPlaylistToPlaylist(playlist.id),
          disabled: playlist.songs.length === 0,
        },
        {
          text: 'Edit playlist',
          icon: Icons.playlistEdit,
          click: () => this.helper.editPlaylist(playlist.id),
        },
        {
          icon: Icons.delete,
          text: 'Delete playlist',
          click: () => this.helper.deletePlaylist(playlist.id),
        },
      ])
    );

    this.songs$ = this.playlists.getByKey(this.playlist.id).pipe(
      filter((playlist): playlist is Playlist => !!playlist),
      map((playlist) => playlist.songs)
    );

    // this.color$ = this.cover$.pipe(
    //   concatMap((cover) =>
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
}
