import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HistoryService } from '@app/services/history.service';
import { merge, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AlbumWithCover$ } from '@app/models/album.model';
import { ArtistWithCover$ } from '@app/models/artist.model';
import { scanArray } from '@app/utils/scan-array.util';
import { SetRequired } from '@app/utils/types.util';

export type HistoryItem =
  | (SetRequired<ArtistWithCover$, 'listenedOn'> & { t: 'artist' })
  | (SetRequired<AlbumWithCover$, 'listenedOn'> & { t: 'album' });

@Component({
  selector: 'app-recent-activity',
  template: `
    <div class="container" *ngIf="a$ | async as a">
      <ng-container *ngIf="a.length > 0">
        <app-title size="small">Recent activity</app-title>
        <app-h-list buttonsTopPosition="80px">
          <div class="item" appHListItem *ngFor="let item of a">
            <app-album
              *ngIf="item.t === 'album'"
              [album]="item"
              size="small"
            ></app-album>
            <app-artist
              *ngIf="item.t === 'artist'"
              [name]="item.name"
              [cover]="item.cover$ | async"
              [artistRouterLink]="['/', 'artist', item.hash]"
            ></app-artist>
          </div>
        </app-h-list>
      </ng-container>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .container {
        margin-top: 32px;
        margin-bottom: 80px;
      }
      app-title {
        margin-bottom: 16px;
      }
      .item {
        margin: 0 24px 0 0;
        width: 160px;
      }
      .item:last-child {
        margin-right: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentActivityComponent implements OnInit {
  a$!: Observable<HistoryItem[]>;

  constructor(private history: HistoryService) {}

  ngOnInit(): void {
    this.a$ = merge(
      this.history.latestPlayedAlbums$().pipe(
        take(20),
        map((m) => ({ ...m, t: 'album' } as HistoryItem))
      ),
      this.history.latestPlayedArtists$().pipe(
        take(20),
        map((m) => ({ ...m, t: 'artist' } as HistoryItem))
      )
    ).pipe(
      scanArray(),
      map((r) =>
        r.sort((i1, i2) => i2.listenedOn.getTime() - i1.listenedOn.getTime())
      ),
      map((r) => r.slice(0, 20))
    );
  }
}
