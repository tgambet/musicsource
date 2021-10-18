import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Icons } from '@app/core/utils';
import { Album } from '@app/database/albums/album.model';
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuItem } from '@app/core/components/menu.component';
import { PlayerFacade } from '@app/player/store/player.facade';
import { ComponentHelperService } from '@app/core/services/component-helper.service';
import { first, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Song } from '@app/database/songs/song.model';
import { HistoryService } from '@app/core/services/history.service';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';

@Component({
  selector: 'app-album',
  template: `
    <app-cover
      [title]="album.title"
      [menuItems]="menuItems"
      [coverRouterLink]="['/', 'album', album.id]"
      (menuOpened)="menuOpened.emit($event)"
      (playlistPlayed)="albumPlayed()"
      tabindex="-1"
      [song]="song$ | async"
      [playlist]="playlist$ | async"
    >
      <img
        *ngIf="cover$ | async as cover; else icon"
        [src]="cover"
        [alt]="album.title"
      />
      <ng-template #icon>
        <app-icon [path]="icons.album" [fullWidth]="true"></app-icon>
      </ng-template>
    </app-cover>
    <app-label
      [topLabel]="{ text: album.title, routerLink: ['/', 'album', album.id] }"
      [bottomLabel]="[
        'Album',
        {
          text: album.albumArtist.name,
          routerLink: ['/', 'artist', album.albumArtist.id]
        },
        album.year ? album.year.toString(10) : ''
      ]"
      [size]="size"
    ></app-label>
  `,
  styles: [
    `
      :host,
      img {
        display: block;
        max-height: 100%;
      }
      app-cover {
        margin-bottom: 16px;
        background-color: rgba(255, 255, 255, 0.1);
      }
      app-icon {
        color: rgba(255, 255, 255, 0.5);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumComponent implements OnInit {
  @Input() album!: Album;
  @Input() size: 'small' | 'large' = 'large';
  @Output() menuOpened = new EventEmitter<MatMenuTrigger>();
  // @Output() update = new EventEmitter<Album>();

  icons = Icons;
  menuItems!: MenuItem[];

  song$!: Observable<Song | undefined>;
  playlist$!: Observable<Song[] | undefined>;
  cover$!: Observable<string | undefined>;

  constructor(
    private player: PlayerFacade,
    private helper: ComponentHelperService,
    private history: HistoryService,
    private albums: AlbumFacade,
    private songs: SongFacade,
    private pictures: PictureFacade
  ) {}

  ngOnInit(): void {
    this.updateMenu();

    this.playlist$ = this.songs.getByAlbumKey(this.album.id);

    this.song$ = this.playlist$.pipe(map((pl) => pl && pl[0]));

    this.cover$ = this.pictures.getAlbumCover(
      this.album,
      this.size === 'small' ? 160 : 226
    );
  }

  /*play() {
    this.library
      .getAlbumTracks(this.album)
      .pipe(
        tap((tracks) => {
          this.player.setPlaying();
          this.player.setPlaylist(tracks);
          this.player.show();
        })
      )
      .subscribe();
  }*/

  updateMenu(): void {
    this.menuItems = [
      {
        icon: Icons.shuffle,
        text: 'Shuffle play',
        click: () => {
          this.songs
            .getByAlbumKey(this.album.id)
            .pipe(
              first(),
              tap((tracks) => {
                this.player.setPlaying();
                this.player.setPlaylist(tracks || []);
                this.player.shuffle();
                this.player.show();
              })
            )
            .subscribe();
          // this.history.albumPlayed(this.album);
        },
      },
      {
        icon: Icons.playlistPlay,
        text: 'Play next',
        click: () => {
          this.songs
            .getByAlbumKey(this.album.id)
            .pipe(
              first(),
              tap((tracks) => {
                this.player.addToPlaylist(tracks || [], true);
                this.player.show();
              })
            )
            .subscribe();
        },
      },
      {
        icon: Icons.playlistMusic,
        text: 'Add to queue',
        click: () => {
          this.songs
            .getByAlbumKey(this.album.id)
            .pipe(
              first(),
              tap((tracks) => {
                this.player.addToPlaylist(tracks || []);
                this.player.show();
              })
            )
            .subscribe();
        },
      },
      {
        icon: !!this.album.likedOn ? Icons.heart : Icons.heartOutline,
        text: !!this.album.likedOn
          ? 'Remove from your likes'
          : 'Add to your likes',
        click: () => {
          this.albums.toggleLiked(this.album); /*.subscribe(() => {
            this.updateMenu();
            // this.update.next(this.album);
          });*/
        },
      },
      {
        icon: Icons.playlistPlus,
        text: 'Add to playlist',
        click: () => {
          this.songs
            .getByAlbumKey(this.album.id)
            .pipe(tap((tracks) => this.helper.addSongsToPlaylist(tracks || [])))
            .subscribe();
        },
      },
      {
        icon: Icons.accountMusic,
        text: 'Go to artist',
        routerLink: ['/', 'artist', this.album.albumArtist.id],
        disabled: !this.album.albumArtist,
      },
    ];
  }

  albumPlayed(): void {
    // this.history.albumPlayed(this.album);
  }
}
