import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Song } from '@app/database/songs/song.model';
import { Observable } from 'rxjs';
import { Icons } from '@app/core/utils/icons.util';
import { MenuItem } from '@app/core/components/menu.component';
import { SongFacade } from '@app/database/songs/song.facade';
import { map } from 'rxjs/operators';
import { HelperFacade } from '@app/helper/helper.facade';

@Component({
  selector: 'app-page-playlist-likes',
  template: `
    <header>
      <app-container-page class="header-container">
        <div class="info">
          <div class="cover" style="--aspect-ratio:1">
            <app-icon-likes2 [fullWidth]="true"></app-icon-likes2>
          </div>
          <div class="metadata">
            <h1>Your Likes</h1>
            <p>
              <span>Auto playlist</span>
            </p>
            <p class="stats" *ngIf="songs$ | async as songs">
              {{ songs.length }} songs • {{ getLength(songs) }} minutes
            </p>
            <p class="description">
              All the songs you liked in MusicSource appear here.
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
              [menuItems]="menuItems$ | async"
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
  songs$!: Observable<Song[]>;

  icons = Icons;

  menuItems$!: Observable<MenuItem[]>;

  constructor(
    private songs: SongFacade,
    private helper: HelperFacade,
  ) {}

  ngOnInit(): void {
    this.songs$ = this.songs
      .getAll('likedOn')
      .pipe(map((songs) => [...songs].reverse()));

    this.menuItems$ = this.songs$.pipe(
      map((songs) => [
        {
          text: 'Play next',
          icon: Icons.playlistPlay,
          click: () =>
            this.helper.addSongsToQueue(
              songs.map((s) => s.id),
              true,
              'Your likes will play next',
            ),
        },
        {
          text: 'Add to queue',
          icon: Icons.playlistPlus,
          click: () =>
            this.helper.addSongsToQueue(
              songs.map((s) => s.id),
              false,
              'Your likes have been added to queue',
            ),
        },
      ]),
    );
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }

  shuffle(songs: Song[]): void {
    this.helper.playSongs(
      songs.map((s) => s.id),
      true,
    );
  }
}
