import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LibraryFacade } from '@app/store/library/library.facade';
import { scan } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AlbumWithCover } from '@app/models/album.model';
import { ArtistWithCover } from '@app/models/artist.model';

@Component({
  selector: 'app-home',
  template: `
    <app-container-home>
      <app-title title="Albums"></app-title>
      <app-h-list buttonsTopPosition="113px">
        <div class="album" appHListItem *ngFor="let album of albums$ | async">
          <app-album
            [name]="album.name"
            [artist]="album.artist"
            [cover]="album.cover"
            [albumRouterLink]="['/', 'album', album.id]"
            [artistRouterLink]="['/', 'artist', album.artistId]"
          ></app-album>
        </div>
      </app-h-list>
      <app-title title="Artists"></app-title>
      <app-h-list buttonsTopPosition="113px">
        <div
          class="artist"
          appHListItem
          *ngFor="let artist of artists$ | async"
        >
          <app-artist
            [name]="artist.name"
            [cover]="artist.cover"
            [artistRouterLink]="['/', 'artist', artist.id]"
          ></app-artist>
        </div>
      </app-h-list>
    </app-container-home>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 32px 0;
      }
      .album,
      .artist {
        margin: 0 24px 0 0;
        width: 226px;
      }
      .album:last-child,
      .artist:last-child {
        margin-right: 0;
      }
      app-title {
        margin-bottom: 40px;
      }
      app-h-list {
        margin: 0 0;
        min-height: 320px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  albums$: Observable<AlbumWithCover[]> = this.library.albums$.pipe(
    // filter((album) => !!album.cover),
    // take(20),
    scan((acc, cur) => [...acc, cur], [] as AlbumWithCover[])
  );

  artists$ = this.library.artists$.pipe(
    // take(20),
    scan((acc, cur) => [...acc, cur], [] as ArtistWithCover[])
  );

  constructor(private library: LibraryFacade) {}

  ngOnInit(): void {}
}
