import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { hash } from '@app/core/utils/hash.util';
import { Icons } from '@app/core/utils/icons.util';
import { PlaylistListComponent } from '@app/player/playlist-list.component';
import { PlayerFacade } from '@app/player/store/player.facade';
import { take, tap } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { SongWithCover$ } from '@app/database/song.model';

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
      <ng-container *ngIf="currentSong$ | async as currentSong">
        <!--cdkDropListLockAxis="y"-->
        <app-playlist-list
          cdkDropList
          #playlistList
          *ngIf="playlist$ | async as playlist"
          [playlist]="playlist"
          [currentSong]="currentSong"
          [currentIndex]="currentIndex$ | async"
          (cdkDropListDropped)="drop(playlist, currentSong, $event)"
        ></app-playlist-list>
      </ng-container>
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
  currentIndex$ = this.player.getCurrentIndex$();

  playlist$ = this.player.getPlaylist$();

  icons = Icons;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private player: PlayerFacade
  ) {}

  @HostListener('click')
  closeMenu(): void {
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

  getHash(artist: string): string {
    return hash(artist);
  }

  drop(
    playlist: SongWithCover$[],
    currentSong: SongWithCover$,
    event: CdkDragDrop<SongWithCover$[]>
  ): void {
    const newPlaylist = [...playlist];
    moveItemInArray(newPlaylist, event.previousIndex, event.currentIndex);
    this.player.setPlaylist(newPlaylist, newPlaylist.indexOf(currentSong));
  }
}
