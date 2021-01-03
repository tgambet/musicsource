import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Album } from '@app/models/album.model';
import { concatMap, map } from 'rxjs/operators';
import { Song } from '@app/models/song.model';
import { Icons } from '@app/utils/icons.util';
import { hash } from '@app/utils/hash.util';
import { PlayerService } from '@app/services/player.service';

export type PageAlbumData = {
  album: Album;
  songs: Song[];
  cover: string | undefined;
};

@Component({
  selector: 'app-page-album',
  template: `
    <ng-container *ngIf="info$ | async as info">
      <header>
        <app-container-page class="header-container">
          <div class="info">
            <div class="cover" style="--aspect-ratio:1">
              <img [src]="info.cover" alt="cover" *ngIf="info.cover" />
            </div>
            <div class="metadata">
              <app-title [title]="info.album.name"></app-title>
              <p>
                <span>Album</span> •
                <a
                  *ngIf="info.album.albumArtist"
                  [routerLink]="[
                    '/',
                    'artist',
                    getHash(info.album.albumArtist)
                  ]"
                  >{{ info.album.albumArtist }}</a
                >
                <span
                  *ngIf="
                    !info.album.albumArtist && info.album.artists.length > 1
                  "
                >
                  Various artists
                </span>
                • <span>{{ info.album.year }}</span>
              </p>
              <p class="stats">
                {{ info.songs.length }} songs •
                {{ getLength(info.songs) }} minutes
              </p>
            </div>
          </div>
          <div class="actions">
            <button mat-raised-button color="accent" (click)="play(info.album)">
              <app-icon [path]="icons.play"></app-icon>
              <span>Play</span>
            </button>
            <button mat-stroked-button>
              <app-icon [path]="icons.heartOutline"></app-icon>
              <span>Add to your likes</span>
            </button>
            <app-menu [disableRipple]="true"></app-menu>
          </div>
        </app-container-page>
      </header>
      <app-container-page>
        <app-track-list [songs]="info.songs"></app-track-list>
      </app-container-page>
    </ng-container>
  `,
  styleUrls: ['../styles/page-header.component.scss'],
  styles: [``],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAlbumComponent implements OnInit {
  icons = Icons;
  info$!: Observable<PageAlbumData>;

  constructor(private route: ActivatedRoute, private player: PlayerService) {}

  ngOnInit(): void {
    this.info$ = this.route.data.pipe(map((data) => data.info));
  }

  getLength(songs: Song[]): number {
    const sec = songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    return Math.floor(sec / 60);
  }

  getHash(albumArtist: string) {
    return hash(albumArtist);
  }

  play(album: Album) {
    this.player
      .playAlbum(album)
      .pipe(concatMap(() => this.player.resume()))
      .subscribe();
  }
}
