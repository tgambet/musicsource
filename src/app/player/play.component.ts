import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Icons } from '@app/core/utils/icons.util';
import { QueueListComponent } from '@app/player/queue-list.component';
import { PlayerFacade } from '@app/player/store/player.facade';
import { filter, first, switchMap, tap } from 'rxjs/operators';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Song, SongId } from '@app/database/songs/song.model';
import { Observable } from 'rxjs';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { AnalyzerService } from '@app/player/analyzer.service';
import {
  animate,
  AnimationTriggerMetadata,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const fadeAnimation: AnimationTriggerMetadata = trigger(
  'fadeAnimation',
  [
    transition(':enter', [
      style({ opacity: 0 }),
      animate('200ms', style({ opacity: 1 })),
    ]),
    transition(':leave', [animate('200ms', style({ opacity: 0 }))]),
  ],
);

@Component({
  selector: 'app-play',
  template: `
    <div class="cover">
      <div class="img-container" (click)="analyzerToggle()">
        <img
          class="img"
          *ngIf="currentCover$ | async as cover"
          [src]="cover"
          alt="cover"
        />
        <div
          class="canvas-container"
          #container
          @fadeAnimation
          *ngIf="analyzer$ | async"
        ></div>
      </div>
    </div>
    <div class="playlist">
      <ng-container *ngIf="currentSong$ | async as currentSong">
        <!--cdkDropListLockAxis="y"-->
        <app-queue-list
          cdkDropList
          #playlistList
          *ngIf="queue$ | async as playlist"
          [songs]="playlist"
          [currentSong]="currentSong"
          [currentIndex]="currentIndex$ | async"
          (cdkDropListDropped)="drop(playlist, currentSong, $event)"
        ></app-queue-list>
      </ng-container>
    </div>
  `,
  animations: [fadeAnimation],
  styles: [
    `
      :host {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        background: black;
        /* padding: 64px 96px 0;*/
        box-sizing: border-box;
        max-height: calc(100vh - 64px);
      }
      .cover {
        flex: 1 1 33%;
        position: relative;
      }
      .img-container {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 32px;
        right: 0;
        cursor: pointer;
      }
      .canvas-container {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      img {
        height: 100%;
        width: 100%;
        object-fit: contain;
      }
      .playlist {
        flex: 1 1 67%;
        position: relative;
      }
      app-queue-list {
        position: absolute;
        height: 100%;
        overflow-y: auto;
        left: 0;
        right: 0;
        bottom: 0;
        font-size: 14px;
      }
      @media (min-width: 950px) {
        :host {
          padding: 32px 64px 0;
          flex-direction: row;
        }
        .cover {
          flex: 1 1 60%;
          position: relative;
        }
        .img-container {
          top: 0;
          left: 0;
          bottom: 32px;
          right: 64px;
        }
        .playlist {
          flex: 1 1 40%;
          position: relative;
        }
        app-queue-list {
          font-size: 16px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayComponent implements OnInit, AfterViewInit {
  @ViewChild('playlistList')
  playlistList!: QueueListComponent;

  @ViewChild('container')
  container!: ElementRef<HTMLElement>;

  currentSong$ = this.player.getCurrentSong$().pipe(
    filter((id): id is SongId => !!id),
    switchMap((id) => this.songs.getByKey(id)),
  );
  currentIndex$ = this.player.getCurrentIndex$();
  currentCover$: Observable<string | undefined> = this.currentSong$.pipe(
    filter((s): s is Song => !!s),
    switchMap((song) => this.pictures.getSongCover(song, 0)),
    tap((cover) => this.analyzer.setCoverColors(cover)),
  );

  queue$ = this.player
    .getQueue$()
    .pipe(switchMap((ids) => this.songs.getByKeys(ids)));

  analyzer$ = this.player.getAnalyzer$();

  icons = Icons;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private player: PlayerFacade,
    private pictures: PictureFacade,
    private songs: SongFacade,
    private analyzer: AnalyzerService,
  ) {}

  ngOnInit(): void {
    this.queue$
      .pipe(
        first(),
        tap((queue) => {
          if (queue.length === 0) {
            this.router.navigate(['/', 'library']);
          }
        }),
      )
      .subscribe();
  }

  drop(playlist: Song[], currentSong: Song, event: CdkDragDrop<Song[]>): void {
    const newPlaylist = [...playlist.map((s) => s.id)];
    moveItemInArray(newPlaylist, event.previousIndex, event.currentIndex);
    this.player.setQueue(newPlaylist, newPlaylist.indexOf(currentSong.id));
  }

  analyzerToggle() {
    this.player.toggleAnalyzer();
    setTimeout(() => this.analyzer.setContainer(this.container?.nativeElement));
  }

  ngAfterViewInit(): void {
    this.analyzer.setContainer(this.container?.nativeElement);
  }
}
