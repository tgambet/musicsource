import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Icons } from '@app/core/utils/icons.util';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mapTo, switchMap, tap } from 'rxjs/operators';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import {
  merge,
  Observable,
  of,
  ReplaySubject,
  share,
  Subscription,
} from 'rxjs';
import { Song, SongId } from '@app/database/songs/song.model';
import { PlayerFacade } from '@app/player/store/player.facade';
import { MenuItem } from '@app/core/components/menu.component';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { SongFacade } from '@app/database/songs/song.facade';
import { HelperFacade } from '@app/helper/helper.facade';

@Component({
  selector: 'app-player',
  template: `
    <a (click)="toggleMenu()" class="back-link"></a>
    <mat-slider
      class="main back"
      color="primary"
      [step]="1"
      [min]="0"
      [max]="max$ | async"
      [value]="value$ | async"
      [tabIndex]="-1"
    ></mat-slider>
    <mat-slider
      class="main front"
      color="primary"
      [step]="1"
      [min]="0"
      [max]="max$ | async"
      [value]="value$ | async"
      [disabled]="seekerDisabled$ | async"
      (change)="seek($event)"
      cdkMonitorSubtreeFocus
      #seeker
    ></mat-slider>
    <div class="left">
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        (click)="playPreviousSong()"
        [disabled]="(prevEnabled$ | async) === false"
      >
        <app-icon [path]="icons.skipPrevious"></app-icon>
      </button>
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        *ngIf="playing$ | async as playing"
        (click)="playing.value ? pause() : resume()"
      >
        <app-icon
          [path]="playing.value ? icons.pause : icons.play"
          [size]="40"
        ></app-icon>
        <!-- TODO 34px on small screen-->
      </button>
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        (click)="playNextSong()"
        [disabled]="(nextEnabled$ | async) === false"
      >
        <app-icon [path]="icons.skipNext"></app-icon>
      </button>
      <span class="time">
        {{ value$ | async | duration }} / {{ max$ | async | duration }}
      </span>
    </div>
    <div class="center" *ngIf="currentSong$ | async as song">
      <div class="cover" style="--aspect-ratio:1">
        <img
          *ngIf="currentSongCover$ | async as cover"
          [src]="cover"
          alt="cover"
        />
      </div>
      <div class="meta">
        <span class="top">{{ song.title }}</span>
        <span class="sub">
          <a
            *ngFor="let artist of song.artists"
            [routerLink]="['/artist', artist.id]"
            >{{ artist.name }}</a
          >
          •
          <a [routerLink]="['/album', song.album.id]">{{ song.album.title }}</a>
          • {{ song.tags.year }}
        </span>
      </div>
      <div class="controls">
        <button
          mat-icon-button
          [disableRipple]="true"
          color="accent"
          (click)="toggleLiked(song)"
        >
          <app-icon
            [path]="!!song.likedOn ? icons.heart : icons.heartOutline"
          ></app-icon>
        </button>
        <app-menu
          [hasBackdrop]="true"
          [menuItems]="menuItems$ | async"
        ></app-menu>
      </div>
    </div>
    <div class="right" (click)="toggleMenu()">
      <div class="volume">
        <button
          mat-icon-button
          [disableRipple]="true"
          color="accent"
          (mouseenter)="showVolume()"
          (click)="toggleMute(); $event.stopPropagation()"
          (mouseup)="$event.stopPropagation()"
        >
          <app-icon
            [path]="icons.volumeHigh"
            *ngIf="(muted$ | async) === false"
          ></app-icon>
          <app-icon
            [path]="icons.volumeOff"
            *ngIf="(muted$ | async) === true"
          ></app-icon>
        </button>
        <mat-slider
          [class.hidden]="!isVolumeShown"
          [min]="0"
          [max]="1"
          [step]="0.01"
          (input)="setVolume($event.value === null ? 1 : $event.value)"
          [value]="volume$ | async"
          (click)="$event.stopPropagation()"
        ></mat-slider>
      </div>
      <ng-container *ngIf="repeat$ | async as repeat">
        <button
          mat-icon-button
          [disableRipple]="true"
          color="accent"
          (click)="setRepeat(repeat); $event.stopPropagation()"
          [class.active]="repeat !== 'none'"
        >
          <app-icon
            [path]="repeat === 'once' ? icons.repeatOnce : icons.repeat"
          ></app-icon>
        </button>
      </ng-container>
      <button
        class="shuffle"
        [class.rotate]="shuffleRotate"
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        (click)="shuffle(); $event.stopPropagation()"
      >
        <app-icon [path]="icons.shuffle"></app-icon>
      </button>
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        class="menu"
        (click)="toggleMenu(); $event.stopPropagation()"
      >
        <app-icon
          [path]="icons.menuUp"
          [size]="36"
          [class.up]="isPlayRoute"
        ></app-icon>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        background-color: #212121;
        white-space: nowrap;
        padding-right: 12px;
        height: 66px;
        position: relative;
        transition: height 300ms ease;
        font-size: 14px;
      }
      :host > * {
        position: relative;
        z-index: 2;
      }
      .back-link {
        position: absolute;
        z-index: 1;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      :host mat-slider.main {
        position: absolute;
        top: -15px;
        width: calc(100% - 8px);
        padding: 0;
        height: 32px;
        cursor: pointer;
      }
      @media (min-width: 950px) {
        :host mat-slider.main {
          width: calc(100% - 12px);
        }
      }
      mat-slider.front {
        top: -16px;
        height: 34px;
        opacity: 0;
        transition: 200ms ease opacity;
      }
      mat-slider:not(.mat-slider-disabled).front:hover,
      mat-slider:not(.mat-slider-disabled).front.cdk-focused {
        opacity: 1;
      }
      .left {
        margin-right: auto;
      }
      .left button {
      }
      .time {
        color: rgb(170, 170, 170);
        font-size: 12px;
        width: 71px;
        display: none;
      }
      .center {
        display: flex;
        align-items: center;
        overflow: hidden;
      }
      .cover {
        flex-shrink: 0;
        height: 40px;
        width: 40px;
        background-color: #717171;
        border-radius: 2px;
        overflow: hidden;
        display: none;
      }
      .meta {
        display: flex;
        flex-direction: column;
        margin: 0 0 0 16px;
        overflow: hidden;
      }
      .meta .top {
        font-weight: 500;
      }
      .meta .sub {
        color: #aaa;
      }
      .meta span {
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .controls button {
        display: none;
      }
      .right {
        margin-left: auto;
      }
      .right button {
        color: #aaa;
        display: none;
      }
      .right button.active {
        color: white;
      }
      .right .menu {
        color: white;
        display: initial;
      }
      .menu app-icon {
        transition: transform 300ms ease;
      }
      .menu app-icon.up {
        transform: rotate(180deg);
        transform-origin: center center;
      }
      .volume {
        position: relative;
        display: none;
      }
      .volume mat-slider {
        position: absolute;
        right: 54px;
        top: -4px;
        transition: opacity 300ms ease;
        cursor: pointer;
        min-width: 80px;
        width: 80px;
      }
      .volume mat-slider.hidden {
        opacity: 0;
        display: none;
      }
      a[href] {
        text-decoration: none;
      }
      a[href]:hover {
        text-decoration: underline;
      }
      @media (min-width: 950px) {
        :host {
          height: 72px;
          font-size: 16px;
        }
        .left button {
          padding: 8px;
          box-sizing: content-box;
        }
        .time {
          display: inline-block;
        }
        .cover {
          display: initial;
        }
        .meta {
          margin-right: 8px;
        }
        .controls button {
          display: initial;
        }
        .right {
          padding-left: 86px;
        }
        .right button {
          display: initial;
          margin-right: 8px;
        }
        .volume {
          display: inline-flex;
        }
      }
      .shuffle.rotate app-icon {
        animation: rotation 0.33s 2 ease;
      }
      @keyframes rotation {
        0% {
          transform: scaleY(1);
          color: white;
        }
        50% {
          transform: scaleY(0);
          color: inherit;
        }
        100% {
          transform: scaleY(1);
          color: white;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('seeker', { static: true })
  seeker!: MatSlider;

  icons = Icons;

  value$!: Observable<number>;
  max$!: Observable<number>;
  seekerDisabled$!: Observable<boolean>;
  currentSong$!: Observable<Song>;
  currentSongCover$!: Observable<string | undefined>;
  menuItems$!: Observable<MenuItem[]>;
  playing$!: Observable<{ value: boolean }>;
  nextEnabled$!: Observable<boolean>;
  prevEnabled$!: Observable<boolean>;
  muted$!: Observable<boolean>;
  volume$!: Observable<number>;
  repeat$!: Observable<'all' | 'once' | 'none'>;

  isPlayRoute!: boolean;
  isVolumeShown = false;

  subscription = new Subscription();
  shuffleRotate = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private player: PlayerFacade,
    private pictures: PictureFacade,
    private songs: SongFacade,
    private helper: HelperFacade,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('mouseleave')
  hideVolume(): void {
    this.isVolumeShown = false;
  }

  showVolume(): void {
    this.isVolumeShown = true;
  }

  ngOnInit(): void {
    const r1$ = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        ),
        // filter((event) => event.snapshot.outlet === 'primary'),
        // tap(
        //   (event) => (this.isPlayRoute = event.snapshot.url[0]?.path === 'play')
        // ),
        tap(
          (event) =>
            (this.isPlayRoute = /\/play$/.test(event.urlAfterRedirects))
        ),
        tap(() => this.cdr.markForCheck())
      )
      .subscribe();

    this.subscription.add(r1$);

    this.isPlayRoute =
      this.route.snapshot.parent?.firstChild?.url[0]?.path === 'play';

    const input$ = this.seeker.input.asObservable().pipe(
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      })
    );
    const change$ = this.seeker.change.asObservable();
    this.value$ = merge(
      of(true),
      input$.pipe(mapTo(false)),
      change$.pipe(mapTo(true))
    ).pipe(
      switchMap((doUpdate) =>
        doUpdate
          ? this.player.getTimeUpdate$()
          : input$.pipe(map((e) => e.value || 0))
      )
    );

    this.max$ = this.player.getDuration$();
    this.playing$ = this.player.getPlaying$().pipe(map((value) => ({ value })));
    this.nextEnabled$ = this.player.hasNextSong$();
    this.prevEnabled$ = this.player.hasPrevSong$();
    this.muted$ = this.player.getMuted$();
    this.volume$ = this.player.getVolume$();
    this.repeat$ = this.player.getRepeat$();

    this.seekerDisabled$ = this.player
      .getDuration$()
      .pipe(map((duration) => duration === 0));

    this.currentSong$ = this.player.getCurrentSong$().pipe(
      filter((song): song is SongId => !!song),
      switchMap((id) => this.songs.getByKey(id)),
      filter((song): song is Song => !!song)
    );

    this.menuItems$ = this.currentSong$.pipe(
      map((song) => [
        {
          text: 'Play next',
          icon: this.icons.playlistPlay,
          click: () => this.helper.addSongToQueue(song.entryPath, true),
        },
        {
          text: 'Add to queue',
          icon: this.icons.playlistMusic,
          click: () => this.helper.addSongToQueue(song.entryPath, false),
        },
        {
          text: !!song.likedOn ? 'Remove from your likes' : 'Add to your likes',
          icon: !!song.likedOn ? this.icons.heart : this.icons.heartOutline,
          click: () => this.toggleLiked(song),
        },
        {
          text: 'Add to playlist',
          icon: this.icons.playlistPlus,
          click: () => this.helper.addSongsToPlaylist([song.entryPath]),
        },
        {
          text: 'Remove from queue',
          icon: this.icons.minusCircleOutline,
          click: () => this.helper.removeSongFromQueue(),
        },
        {
          text: 'Go to album',
          icon: this.icons.album,
          routerLink: ['/album', song.album.id],
        },
        {
          text: 'Go to artist',
          icon: this.icons.accountMusic,
          routerLink: ['/artist', song.artists[0].id],
        },
      ])
    );

    this.currentSongCover$ = this.currentSong$.pipe(
      switchMap((song) => this.pictures.getSongCover(song, 40))
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  seek(n: MatSliderChange): void {
    if (n.value !== null) {
      this.player.seek(n.value);
    }
  }

  resume(): void {
    this.player.resume();
  }

  pause(): void {
    this.player.pause();
  }

  playNextSong(): void {
    this.player.setNextIndex();
  }

  playPreviousSong(): void {
    this.player.setPrevIndex();
  }

  shuffle(): void {
    this.shuffleRotate = true;
    setTimeout(() => (this.shuffleRotate = false), 666);
    this.player.shuffle();
  }

  async toggleMenu(): Promise<void | boolean> {
    if (this.isPlayRoute) {
      if (history.length > 2) {
        return history.back();
      }
      return await this.router.navigate(['/', 'library']);
    }
    return await this.router.navigate(['/', 'play']);
  }

  toggleLiked(song: Song): void {
    this.songs.toggleLiked(song);
  }

  toggleMute(): void {
    this.player.toggleMute();
  }

  setVolume(volume: number): void {
    this.player.setVolume(volume);
  }

  setRepeat(repeat: 'all' | 'once' | 'none') {
    switch (repeat) {
      case 'all':
        this.player.setRepeat('once');
        break;
      case 'once':
        this.player.setRepeat('none');
        break;
      default:
        this.player.setRepeat('all');
        break;
    }
  }
}
