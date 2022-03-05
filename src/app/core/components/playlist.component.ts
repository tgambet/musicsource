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
        </ng-container>
      </ng-container>
      <ng-template #icon>
        <app-icon [path]="icons.playlistPlay" [size]="72"></app-icon>
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
      app-icon {
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
    this.cover$ = this.pictures.getCover(this.playlist.pictureKey);

    // TODO
    this.color$ = of('red');

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
        // {
        //   icon: Icons.pencil,
        //   text: 'Edit playlist',
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
          icon: Icons.delete,
          text: 'Delete playlist',
          click: () => this.playlists.delete(playlist.id),
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

  play(): void {
    // this.helper.playPlaylist(playlist.id);
    // this.state = 'loading';
    // setTimeout(() => {
    //   this.state = 'playing';
    //   this.cdr.markForCheck();
    // }, 1000);
    // this.songs
    //   .getByKeys(this.playlist.songs)
    //   .pipe(
    //     first(),
    //     tap((songs) => {
    //       this.player.setPlaying();
    //       this.player.setQueue(
    //         songs.map((s) => s.entryPath),
    //         0
    //       );
    //       this.player.show();
    //     })
    //   )
    //   .subscribe();
  }

  // toggleLiked(): void {
  //   this.playlists.toggleLiked(this.playlist);
  //
  //
  //   this.snack.open(
  //     !!this.playlist.likedOn
  //       ? 'Removed from your likes'
  //       : 'Added to your likes'
  //   );
  //
  //   // this.library
  //   //   .togglePlaylistFavorite(this.playlist)
  //   //   .pipe(
  //   //     tap(
  //   //       () =>
  //   //         (this.playlist.likedOn = !!this.playlist.likedOn
  //   //           ? undefined
  //   //           : new Date())
  //   //     ),
  //   //     tap(() => this.updateMenu()),
  //   //     // tap(() => this.update.next(this.playlist)),
  //   //     tap(() =>
  //   //       this.snack.open(
  //   //         !!this.playlist.likedOn
  //   //           ? 'Added to your likes'
  //   //           : 'Removed from your likes'
  //   //       )
  //   //     )
  //   //   )
  //   //   // .pipe(tap(() => this.cdr.markForCheck()))
  //   //   .subscribe();
  // }
  // updateMenu(): void {
  //   this.menuItems = [
  //     {
  //       icon: Icons.shuffle,
  //       text: 'Shuffle play',
  //       click: () => alert('clicked'),
  //     },
  //     // {
  //     //   icon: Icons.radio,
  //     //   text: 'Start radio',
  //     // },
  //     // {
  //     //   icon: Icons.pencil,
  //     //   text: 'Edit playlist',
  //     // },
  //     {
  //       icon: Icons.playlistPlay,
  //       text: 'Play next',
  //       // click: () => (menuItems[0].icon = Icons.heartOutline),
  //     },
  //     {
  //       icon: Icons.playlistMusic,
  //       text: 'Add to queue',
  //     },
  //     {
  //       icon: !!this.playlist.likedOn ? Icons.heart : Icons.heartOutline,
  //       text: !!this.playlist.likedOn
  //         ? 'Remove from your likes'
  //         : 'Add to your likes',
  //       click: () => this.toggleLiked(),
  //     },
  //     {
  //       icon: Icons.playlistPlus,
  //       text: 'Add to playlist',
  //     },
  //     {
  //       icon: Icons.delete,
  //       text: 'Delete playlist',
  //     },
  //   ];
  // }
}
