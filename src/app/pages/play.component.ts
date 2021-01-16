import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { hash } from '@app/utils/hash.util';
import { Icons } from '@app/utils/icons.util';
import { PlaylistListComponent } from '@app/components/playlist-list.component';
import { PlayerFacade } from '@app/store/player/player.facade';
import { take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-play',
  template: `
    <div class="cover">
      <div class="img-container" *ngIf="currentSong$ | async as currentSong">
        <img
          class="img"
          *ngIf="currentSong.cover$ | async as cover"
          [src]="cover"
          alt="cover"
        />
      </div>
    </div>
    <div class="playlist">
      <app-playlist-list
        #playlistList
        *ngIf="playlist$ | async as playlist"
        [playlist]="playlist"
        (playClicked)="play($event)"
        [currentSong]="currentSong$ | async"
      ></app-playlist-list>
    </div>
  `,
  styles: [
    `
      :host {
        flex-grow: 1;
        display: flex;
        background: black;
        padding: 64px 96px 0;
        box-sizing: border-box;
      }
      .cover {
        flex: 1 1 auto;
        padding-bottom: 64px;
        position: relative;
      }
      .img-container {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 64px;
        right: 0;
      }
      img {
        height: 100%;
        width: 100%;
        object-fit: contain;
      }
      .playlist {
        flex: 0 0 620px;
        padding-left: 96px;
        position: relative;
      }
      app-playlist-list {
        position: absolute;
        height: 100%;
        overflow-y: auto;
        left: 96px;
        right: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayComponent implements OnInit {
  @ViewChild('playlistList')
  playlistList!: PlaylistListComponent;

  currentSong$ = this.player.getCurrentSong$();

  playlist$ = this.player.getPlaylist$();

  icons = Icons;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private player: PlayerFacade
  ) {}

  @HostListener('click')
  closeMenu() {
    this.playlistList.closeMenu();
  }

  ngOnInit(): void {
    this.playlist$
      .pipe(
        take(1),
        tap((playlist) => {
          if (playlist.length === 0) {
            this.router.navigate(['/', 'library']);
          }
        })
      )
      .subscribe();
  }

  getHash(artist: string) {
    return hash(artist);
  }

  play(index: number) {
    this.player.setPlaying();
    this.player.setCurrentIndex(index);
  }
}
