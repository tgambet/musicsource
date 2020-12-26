import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LibraryFacade } from '@app/store/library/library.facade';
import { Observable } from 'rxjs';
import { AlbumWithCover } from '@app/models/album.model';
import { scan } from 'rxjs/operators';

@Component({
  selector: 'app-library-albums',
  template: `
    <div class="album" *ngFor="let album of albums$ | async; trackBy: trackBy">
      <app-album
        [name]="album.name"
        [cover]="album.cover"
        [artist]="album.artist"
        [year]="album.year"
        [artistRouterLink]="['/', 'artist', album.artistId]"
        [albumRouterLink]="['/', 'album', album.id]"
        size="small"
      ></app-album>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        margin: 0 -12px;
        padding: 24px 0 64px;
      }
      .album {
        margin: 0 12px 32px;
      }
      app-album {
        width: 160px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryAlbumsComponent implements OnInit {
  albums$: Observable<AlbumWithCover[]>;

  constructor(private library: LibraryFacade) {
    this.albums$ = library.albums$.pipe(
      scan((acc, cur) => [...acc, cur], [] as AlbumWithCover[])
    );
  }

  trackBy = (index: number, album: AlbumWithCover) => album.id;

  ngOnInit(): void {}
}
