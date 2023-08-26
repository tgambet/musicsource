import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { SelectOption } from '@app/core/components/select.component';
import { Filter } from '@app/core/components/filters.component';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, filter, first, map } from 'rxjs/operators';
import { combineLatest, distinctUntilChanged, Observable, of } from 'rxjs';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { ListItem } from '@app/core/components/list.component';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { toDuration } from '@app/core/pipes/duration.pipe';
import { Icons } from '@app/core/utils';
import { HelperFacade } from '@app/helper/helper.facade';
import { Song } from '@app/database/songs/song.model';

@Component({
  selector: 'app-library-likes',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
      [filters]="filters"
      [selectedFilterIndex]="selectedFilterIndex$ | async"
    >
      <ng-container *ngIf="playlistsItems$ | async as playlists">
        <ng-container *ngIf="playlists.length > 0">
          <app-title size="small"> Playlists </app-title>
          <app-list
            [items]="playlists"
            [defaultIcon]="icons.playlistPlay"
          ></app-list>
          <app-link
            [link]="['..', 'playlists']"
            fragment="top"
            *ngIf="(routeParam$ | async) === 'all'"
          >
            Show All
          </app-link>
        </ng-container>
      </ng-container>
      <ng-container *ngIf="albumsItems$ | async as albums">
        <ng-container *ngIf="albums.length > 0">
          <app-title size="small"> Albums </app-title>
          <app-list [items]="albums" [defaultIcon]="icons.album"></app-list>
          <app-link
            [link]="['..', 'albums']"
            fragment="top"
            *ngIf="(routeParam$ | async) === 'all'"
          >
            Show All
          </app-link>
        </ng-container>
      </ng-container>
      <ng-container *ngIf="songsItems$ | async as songs">
        <ng-container *ngIf="songs.length > 0">
          <app-title size="small"> Songs </app-title>
          <app-list [items]="songs"></app-list>
          <app-link
            [link]="['..', 'songs']"
            fragment="top"
            *ngIf="(routeParam$ | async) === 'all'"
          >
            Show All
          </app-link>
        </ng-container>
      </ng-container>
      <ng-container *ngIf="artistsItems$ | async as artists">
        <ng-container *ngIf="artists.length > 0">
          <app-title size="small"> Artists </app-title>
          <app-list
            [items]="artists"
            [round]="true"
            [defaultIcon]="icons.account"
          ></app-list>
          <app-link
            [link]="['..', 'artists']"
            fragment="top"
            *ngIf="(routeParam$ | async) === 'all'"
          >
            Show All
          </app-link>
        </ng-container>
      </ng-container>
    </app-library-content>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      app-title {
        margin: 1rem 0;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryLikesComponent implements OnInit {
  icons = Icons;

  sortOptions: SelectOption[] = [
    // { name: 'Latest update', value: 'year_desc' },
    // { name: 'A to Z', value: 'title_asc' },
    // { name: 'Z to A', value: 'title_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];
  filters: Filter[] = [
    { label: 'Playlists', path: 'playlists' },
    { label: 'Albums', path: 'albums' },
    { label: 'Songs', path: 'songs' },
    { label: 'Artists', path: 'artists' },
  ];
  selectedFilterIndex$!: Observable<null | number>;

  routeParam$!: Observable<string | null>;

  playlistsItems$!: Observable<ListItem[]>;
  albumsItems$!: Observable<ListItem[]>;
  songsItems$!: Observable<ListItem[]>;
  artistsItems$!: Observable<ListItem[]>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private playlists: PlaylistFacade,
    private albums: AlbumFacade,
    private songs: SongFacade,
    private artists: ArtistFacade,
    private pictures: PictureFacade,
    private helper: HelperFacade,
  ) {}

  ngOnInit() {
    this.routeParam$ = this.route.paramMap.pipe(
      map((params) => params.get('type')),
    );

    const obs$ = <T>(obs: Observable<T[]>, key: string) =>
      combineLatest([
        this.routeParam$,
        obs.pipe(
          distinctUntilChanged((prev, curr) => prev.length === curr.length),
        ),
      ]).pipe(
        map(([type, models]) =>
          type === key || type === 'all'
            ? [...models].reverse().slice(0, type === key ? Infinity : 3)
            : [],
        ),
      );

    const playlists$ = obs$(this.playlists.getAll('likedOn'), 'playlists');
    const albums$ = obs$(this.albums.getAll('likedOn'), 'albums');
    const songs$ = obs$(this.songs.getAll('likedOn'), 'songs');
    const artists$ = obs$(this.artists.getAll('likedOn'), 'artists');

    this.playlistsItems$ = playlists$.pipe(
      map((playlists) =>
        playlists.map((playlist) => ({
          title: playlist.title,
          label: ['Playlist', `${playlist.songs.length} songs`],
          cover$: this.pictures.getPlaylistCover(playlist, 56),
          border$: this.pictures.getPlaylistCover(playlist, 56).pipe(
            concatMap((cover) =>
              cover ? this.pictures.getCoverColor(cover) : of(undefined),
            ),
            map((rgb) => rgb && `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.5)`),
          ),
          routerLink: ['/playlist', playlist.id],
          menuItems: [
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
          ],
          queue$: of(playlist.songs),
        })),
      ),
    );

    this.albumsItems$ = albums$.pipe(
      map((albums) =>
        albums.map((album) => ({
          title: album.title,
          label: [
            'Album',
            {
              text: album.albumArtist.name,
              routerLink: ['/artist', album.albumArtist.id],
            },
            album.year?.toString(),
          ],
          cover$: this.pictures.getAlbumCover(album.id, 56),
          routerLink: ['/album', album.id],
          menuItems: [
            {
              icon: Icons.shuffle,
              text: 'Shuffle play',
              click: () => this.helper.playAlbum(album.id, true),
            },
            {
              icon: Icons.playlistPlay,
              text: 'Play next',
              click: () => this.helper.addAlbumToQueue(album.id, true),
            },
            {
              icon: Icons.playlistMusic,
              text: 'Add to queue',
              click: () => this.helper.addAlbumToQueue(album.id, false),
            },
            {
              icon: album.likedOn ? Icons.heart : Icons.heartOutline,
              text: album.likedOn
                ? 'Remove from your likes'
                : 'Add to your likes',
              click: () => this.albums.toggleLiked(album),
            },
            {
              icon: Icons.playlistPlus,
              text: 'Add to playlist',
              click: () => this.helper.addAlbumToPlaylist(album.id),
            },
            {
              icon: Icons.accountMusic,
              text: 'Go to artist',
              routerLink: ['/', 'artist', album.albumArtist?.id],
              disabled: !album.albumArtist,
            },
          ],
          queue$: this.songs.getByAlbumKey(album.id).pipe(
            filter((songs): songs is Song[] => !!songs),
            first(),
            map((songs) => songs.map((s) => s.id)),
          ),
        })),
      ),
    );

    this.songsItems$ = songs$.pipe(
      map((songs) =>
        songs.map((song) => ({
          title: song.title || '',
          label: [
            'Song',
            {
              text: song.artists[0]?.name,
              routerLink: ['/artist', song.artists[0]?.id],
            },
            { text: song.album.title, routerLink: ['/album', song.album.id] },
            toDuration(song.duration),
          ],
          cover$: this.pictures.getSongCover(song, 56),
          menuItems: [
            {
              icon: Icons.playlistPlay,
              text: 'Play next',
              click: () => this.helper.addSongToQueue(song.id, true),
            },
            {
              icon: Icons.playlistMusic,
              text: 'Add to queue',
              click: () => this.helper.addSongToQueue(song.id, false),
            },
            {
              icon: song.likedOn ? Icons.heart : Icons.heartOutline,
              text: song.likedOn
                ? 'Remove from your likes'
                : 'Add to your likes',
              click: () => this.songs.toggleLiked(song),
            },
            {
              icon: Icons.playlistPlus,
              text: 'Add to playlist',
              click: () => this.helper.addSongsToPlaylist([song.id]),
            },
            {
              icon: Icons.album,
              text: 'Go to album',
              routerLink: ['/', 'album', song.album.id],
              disabled: !song.album,
            },
            {
              icon: Icons.accountMusic,
              text: 'Go to artist',
              routerLink: ['/', 'artist', song.artists[0]?.id],
              disabled: !song.artists[0],
            },
          ],
          queue$: of([song.id]),
        })),
      ),
    );

    this.artistsItems$ = artists$.pipe(
      map((artists) =>
        artists.map((a) => ({
          title: a.name,
          label: ['Artist'],
          cover$: this.pictures.getArtistCover(a.id, 56),
          routerLink: ['/artist', a.id],
          menuItems: [
            {
              icon: Icons.shuffle,
              text: 'Shuffle play',
              click: () => this.helper.playArtist(a.id),
            },
          ],
        })),
      ),
    );

    this.selectedFilterIndex$ = this.route.paramMap.pipe(
      map((params) => {
        switch (params.get('type')) {
          case 'playlists':
            return 0;
          case 'albums':
            return 1;
          case 'songs':
            return 2;
          case 'artists':
            return 3;
          default:
            return null;
        }
      }),
    );
  }
}
