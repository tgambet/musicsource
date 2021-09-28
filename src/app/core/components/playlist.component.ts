import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { Icons } from '@app/core/utils';
import { Playlist } from '@app/database/playlist.model';
import { from, Observable, of, toArray } from 'rxjs';
import { LibraryFacade } from '@app/library/store/library.facade';
import { concatMap, map, tap } from 'rxjs/operators';
import { MenuItem } from '@app/core/components/menu.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerFacade } from '@app/player/store/player.facade';

@Component({
  selector: 'app-playlist',
  template: `
    <app-cover
      [title]="playlist.title"
      [menuItems]="menuItems"
      [coverRouterLink]="['/', 'playlist', playlist.hash]"
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
        routerLink: ['/', 'playlist', playlist.hash]
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

  @Output() update = new EventEmitter<Playlist>();

  icons = Icons;

  menuItems!: MenuItem[];

  cover$!: Observable<string | undefined>;

  color$!: Observable<any>;

  constructor(
    private library: LibraryFacade,
    private snack: MatSnackBar,
    private player: PlayerFacade,
    @Optional() private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateMenu();

    this.cover$ = this.library.getCover(this.playlist.pictureKey);

    this.color$ = this.cover$.pipe(
      concatMap((cover) =>
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

  play(): void {
    // this.state = 'loading';
    // setTimeout(() => {
    //   this.state = 'playing';
    //   this.cdr.markForCheck();
    // }, 1000);
    this.library
      .getPlaylistSongs(this.playlist)
      .pipe(
        toArray(),
        tap((songs) => {
          this.player.setPlaying();
          this.player.setPlaylist(songs, 0);
          this.player.show();
        })
      )
      .subscribe();
  }

  toggleLikePlaylist(): void {
    this.library
      .togglePlaylistFavorite(this.playlist)
      .pipe(
        tap(
          () =>
            (this.playlist.likedOn = !!this.playlist.likedOn
              ? undefined
              : new Date())
        ),
        tap(() => this.updateMenu()),
        tap(() => this.update.next(this.playlist)),
        tap(() =>
          this.snack.open(
            !!this.playlist.likedOn
              ? 'Added to your likes'
              : 'Removed from your likes'
          )
        )
      )
      // .pipe(tap(() => this.cdr.markForCheck()))
      .subscribe();
  }

  updateMenu(): void {
    this.menuItems = [
      {
        icon: Icons.shuffle,
        text: 'Shuffle play',
        click: () => alert('clicked'),
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
        // click: () => (menuItems[0].icon = Icons.heartOutline),
      },
      {
        icon: Icons.playlistMusic,
        text: 'Add to queue',
      },
      {
        icon: !!this.playlist.likedOn ? Icons.heart : Icons.heartOutline,
        text: !!this.playlist.likedOn
          ? 'Remove from your likes'
          : 'Add to your likes',
        click: () => this.toggleLikePlaylist(),
      },
      {
        icon: Icons.playlistPlus,
        text: 'Add to playlist',
      },
      {
        icon: Icons.delete,
        text: 'Delete playlist',
      },
    ];
  }
}
