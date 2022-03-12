import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { SelectOption } from '@app/core/components/select.component';
import { Filter } from '@app/core/components/filters.component';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { combineLatest, Observable, of } from 'rxjs';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { ArtistFacade } from '@app/database/artists/artist.facade';
import { ListItem } from '@app/core/components/list.component';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { toDuration } from '@app/core/pipes/duration.pipe';
import { Icons } from '@app/core/utils';

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
    private pictures: PictureFacade
  ) {}

  ngOnInit() {
    this.routeParam$ = this.route.paramMap.pipe(
      map((params) => params.get('type'))
    );

    const obs$ = <T>(obs: Observable<T[]>, key: string) =>
      combineLatest([this.routeParam$, obs]).pipe(
        map(([type, models]) =>
          type === key || type === 'all'
            ? [...models].reverse().slice(0, type === key ? Infinity : 3)
            : []
        )
      );

    const playlists$ = obs$(this.playlists.getAll('likedOn'), 'playlists');
    const albums$ = obs$(this.albums.getAll('likedOn'), 'albums');
    const songs$ = obs$(this.songs.getAll('likedOn'), 'songs');
    const artists$ = obs$(this.artists.getAll('likedOn'), 'artists');

    this.playlistsItems$ = playlists$.pipe(
      map((playlists) =>
        playlists.map((p) => ({
          title: p.title,
          label: ['Playlist', `${p.songs.length} songs`],
          cover$: of(undefined),
          routerLink: ['/playlist', p.id],
        }))
      )
    );

    this.albumsItems$ = albums$.pipe(
      map((albums) =>
        albums.map((a) => ({
          title: a.title,
          label: [
            'Album',
            {
              text: a.albumArtist.name,
              routerLink: ['/artist', a.albumArtist.id],
            },
            a.year?.toString(),
          ],
          cover$: this.pictures.getAlbumCover(a, 56),
          routerLink: ['/album', a.id],
        }))
      )
    );

    this.songsItems$ = songs$.pipe(
      map((songs) =>
        songs.map((a) => ({
          title: a.title || '',
          label: [
            'Song',
            {
              text: a.artists[0]?.name,
              routerLink: ['/artist', a.artists[0]?.id],
            },
            { text: a.album.title, routerLink: ['/album', a.album.id] },
            toDuration(a.duration),
          ],
          cover$: this.pictures.getSongCover(a, 56),
        }))
      )
    );

    this.artistsItems$ = artists$.pipe(
      map((artists) =>
        artists.map((a) => ({
          title: a.name,
          label: ['Artist'],
          cover$: this.pictures.getArtistCover(a, 56),
          routerLink: ['/artist', a.id],
        }))
      )
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
      })
    );
  }
}
