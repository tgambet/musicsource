import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
import { SelectOption } from '@app/components/select.component';
import { EMPTY, merge, Observable } from 'rxjs';
import { SongWithCover$ } from '@app/models/song.model';
import { LibraryFacade } from '@app/store/library/library.facade';
import {
  catchError,
  concatMap,
  last,
  publish,
  scan,
  skip,
  take,
  tap,
} from 'rxjs/operators';
import { tapError } from '@app/utils/tap-error.util';
import { Icons } from '@app/utils/icons.util';

@Component({
  selector: 'app-library-songs',
  template: `
    <app-library-content
      [sortOptions]="sortOptions"
      [selectedSortOption]="selectedSortOption"
    >
      <div class="songs">
        <ng-container *ngFor="let songs$ of songsObs">
          <div
            class="song"
            *ngFor="let song of songs$ | async; trackBy: trackBy"
          >
            <div class="cover" style="--aspect-ratio:1">
              <img
                *ngIf="song.cover$ | async as cover"
                [src]="cover"
                alt="cover"
              />
              <app-player-button
                size="small"
                shape="square"
              ></app-player-button>
            </div>
            <span class="title">{{ song.title }}</span>
            <span class="artist">{{ song.artist }}</span>
            <span class="album">{{ song.album }}</span>
            <span class="controls">
              <button mat-icon-button>
                <app-icon [path]="icons.heartOutline"></app-icon>
              </button>
              <app-menu></app-menu>
            </span>
          </div>
        </ng-container>
      </div>
    </app-library-content>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 1200px;
      }
      .songs {
        display: flex;
        flex-direction: column;
      }
      .song {
        flex: 0 0 48px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
      }
      .cover {
        width: 32px;
        margin-right: 16px;
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }
      .cover app-player-button {
        position: absolute;
        top: -4px;
        left: -4px;
        visibility: hidden;
      }
      .song:hover app-player-button {
        visibility: visible;
      }
      .title {
        flex: 12 1 0;
      }
      .artist,
      .album {
        color: #aaa;
        flex: 9 1 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .controls {
        flex: 0 0 auto;
        visibility: hidden;
      }
      .song:hover .controls {
        visibility: visible;
      }
      .controls button {
        margin-right: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibrarySongsComponent implements OnInit {
  sortOptions: SelectOption[] = [
    { name: 'A to Z', value: 'name_asc' },
    { name: 'Z to A', value: 'name_desc' },
  ];
  selectedSortOption: SelectOption = this.sortOptions[0];

  icons = Icons;

  songsObs: Observable<SongWithCover$[]>[] = [];

  lastSong?: SongWithCover$;
  loadMore = false;

  constructor(private library: LibraryFacade) {}

  @HostListener('window:scroll')
  update() {
    if (
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 64 &&
      this.loadMore
    ) {
      this.pushSongs();
    }
  }

  ngOnInit(): void {
    this.pushSongs();
  }

  pushSongs(): void {
    this.loadMore = false;

    const query: IDBKeyRange | null = this.lastSong
      ? IDBKeyRange.lowerBound(this.lastSong.title, false)
      : null;

    this.songsObs.push(
      this.library.getSongs('title', query).pipe(
        skip(query ? 1 : 0),
        take(100),
        scan((acc, cur) => [...acc, cur], [] as SongWithCover$[]),
        publish((m$) =>
          merge(
            m$.pipe(
              last(),
              tap((songs) => (this.lastSong = songs[songs.length - 1])),
              tap(() => (this.loadMore = true)),
              tapError(() => (this.loadMore = false)),
              concatMap(() => EMPTY),
              catchError(() => EMPTY)
            ),
            m$,
            2
          )
        )
      )
    );
  }

  trackBy(index: number, song: SongWithCover$): string {
    return song.entryPath;
  }
}
