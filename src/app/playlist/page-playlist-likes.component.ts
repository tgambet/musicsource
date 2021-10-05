import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Song } from '@app/database/songs/song.model';
import { Observable } from 'rxjs';
import { LibraryFacade } from '@app/library/store/library.facade';
import { first, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { Icons } from '@app/core/utils/icons.util';
import { scanArray } from '@app/core/utils/scan-array.util';
import { SongListComponent } from '@app/core/components/song-list.component';
import { ComponentHelperService } from '@app/core/services/component-helper.service';
import { MenuItem } from '@app/core/components/menu.component';

@Component({
  selector: 'app-page-playlist-likes',
  template: `
    <header (click)="songList?.closeMenu()">
      <app-container-page class="header-container">
        <div class="info">
          <div class="cover" style="--aspect-ratio:1">
            <app-icon-likes2 [fullWidth]="true"></app-icon-likes2>
          </div>
          <div class="metadata">
            <app-title>Your Likes</app-title>
            <p>
              <span>Auto playlist</span>
            </p>
            <p class="stats" *ngIf="songs$ | async as songs">
              {{ songs.length }} songs • {{ getLength(songs) }} minutes
            </p>
            <p class="description">
              All the songs you liked in MusicSource appears here.
            </p>
          </div>
        </div>
        <div class="actions">
          <ng-container *ngIf="songs$ | async as songs">
            <button
              mat-raised-button
              class="play-button"
              color="accent"
              [disabled]="songs.length === 0"
              (click)="shuffle(songs)"
            >
              <app-icon [path]="icons.shuffle"></app-icon>
              <span>Shuffle</span>
            </button>
            <app-menu
              [disableRipple]="true"
              [menuItems]="menuItems"
              [hasBackdrop]="true"
              [disabled]="songs.length === 0"
              *ngIf="songs.length > 0"
            ></app-menu>
          </ng-container>
        </div>
      </app-container-page>
    </header>
    <app-container-page>
      <app-song-list
        *ngIf="songs$ | async as songs"
        [songs]="songs"
        #songList
      ></app-song-list>
      <p class="empty" *ngIf="(songs$ | async)?.length === 0">
        No liked songs yet.
      </p>
    </app-container-page>
  `,
  styleUrls: ['../core/styles/page-header.component.scss'],
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePlaylistLikesComponent implements OnInit {
  @ViewChild('songList', { static: false })
  songList?: SongListComponent;

  songs$!: Observable<Song[]>;

  icons = Icons;

  menuItems: MenuItem[] = [
    {
      text: 'Play next',
      icon: Icons.playlistPlay,
      click: (): void => {
        this.songs$
          .pipe(
            first(),
            tap((songs) => this.helper.addSongsToQueue(songs, true))
          )
          .subscribe();
      },
    },
    {
      text: 'Add to queue',
      icon: Icons.playlistPlus,
      click: (): void => {
        this.songs$
          .pipe(
            first(),
            tap((songs) => this.helper.addSongsToQueue(songs, false))
          )
          .subscribe();
      },
    },
  ];

  constructor(
    private library: LibraryFacade,
    private helper: ComponentHelperService
  ) {}

  ngOnInit(): void {
    this.songs$ = this.library.getSongs('likedOn', undefined, 'prev').pipe(
      map(({ value }) => value),
      scanArray(),
      startWith([]),
      shareReplay(1)
    );
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }

  shuffle(songs: Song[]): void {
    this.helper.shufflePlaySongs(songs);
  }
}
