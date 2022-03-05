import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Icons } from '@app/core/utils';
import { Album } from '@app/database/albums/album.model';
import { MenuItem } from '@app/core/components/menu.component';
import { PlayerFacade } from '@app/player/store/player.facade';
import { ComponentHelperService } from '@app/core/services/component-helper.service';
import { filter, first, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Song } from '@app/database/songs/song.model';
import { HistoryService } from '@app/core/services/history.service';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { HelperFacade } from '@app/helper/helper.facade';

@Component({
  selector: 'app-album',
  template: `
    <app-cover
      [title]="album.title"
      [menuItems]="menuItems$ | async"
      [coverRouterLink]="['/', 'album', album.id]"
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

  icons = Icons;
  menuItems$!: Observable<MenuItem[]>;

  song$!: Observable<Song | undefined>;
  playlist$!: Observable<Song[] | undefined>;
  cover$!: Observable<string | undefined>;

  constructor(
    private player: PlayerFacade,
    private helper: ComponentHelperService,
    private history: HistoryService,
    private albums: AlbumFacade,
    private songs: SongFacade,
    private pictures: PictureFacade,
    private helper2: HelperFacade
  ) {}

  ngOnInit(): void {
    this.playlist$ = this.songs.getByAlbumKey(this.album.id);

    this.song$ = this.playlist$.pipe(map((pl) => pl && pl[0]));

    this.cover$ = this.pictures.getAlbumCover(
      this.album,
      this.size === 'small' ? 160 : 226
    );

    this.menuItems$ = this.albums.getByKey(this.album.id).pipe(
      filter((album): album is Album => !!album),
      map((album) => [
        {
          icon: Icons.shuffle,
          text: 'Shuffle play',
          click: () => this.helper2.playAlbum(album.id, true),
        },
        {
          icon: Icons.playlistPlay,
          text: 'Play next',
          click: () => this.helper2.addAlbumToQueue(album.id, true),
        },
        {
          icon: Icons.playlistMusic,
          text: 'Add to queue',
          click: () => this.helper2.addAlbumToQueue(album.id, false),
        },
        {
          icon: album.likedOn ? Icons.heart : Icons.heartOutline,
          text: album.likedOn ? 'Remove from your likes' : 'Add to your likes',
          click: () => this.albums.toggleLiked(album),
        },
        {
          icon: Icons.playlistPlus,
          text: 'Add to playlist',
          click: () => {
            this.songs
              .getByAlbumKey(album.id)
              .pipe(
                first(),
                tap((tracks) => this.helper2.addSongsToPlaylist(tracks || []))
              )
              .subscribe();
          },
        },
        {
          icon: Icons.accountMusic,
          text: 'Go to artist',
          routerLink: ['/', 'artist', album.albumArtist.id],
          disabled: !album.albumArtist,
        },
      ])
    );
  }

  albumPlayed(): void {
    // this.history.albumPlayed(this.album);
  }
}
