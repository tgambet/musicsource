import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Icons } from '@app/utils/icons.util';
import { ActivatedRoute, ActivationStart, Router } from '@angular/router';
import {
  filter,
  map,
  mapTo,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { LibraryFacade } from '@app/store/library/library.facade';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { merge, Observable, of, Subscription } from 'rxjs';
import { SongWithCover$ } from '@app/models/song.model';
import { PlayerFacade } from '@app/store/player/player.facade';
import { hash } from '@app/utils/hash.util';
import { ComponentHelperService } from '@app/services/component-helper.service';
import { MenuItem } from '@app/components/menu.component';

@Component({
  selector: 'app-player',
  template: `
    <a (click)="toggleMenu()" class="back-link"></a>
    <mat-slider
      class="back"
      color="primary"
      [step]="1"
      [min]="0"
      [max]="max$ | async"
      [value]="value$ | async"
      [tabIndex]="-1"
    ></mat-slider>
    <mat-slider
      class="front"
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
        <img *ngIf="song.cover$ | async as cover" [src]="cover" alt="cover" />
      </div>
      <div class="meta">
        <span class="top">{{ song.title }}</span>
        <span class="sub">
          <a
            *ngIf="song.artist"
            [routerLink]="['/artist', getHash(song.artist)]"
            >{{ song.artist }}</a
          >
          •
          <a
            *ngIf="song.album"
            [routerLink]="['/album', getHash(song.album)]"
            >{{ song.album }}</a
          >
          • {{ song.year }}
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
        <app-menu [hasBackdrop]="true" [menuItems]="menuItems"></app-menu>
      </div>
    </div>
    <div class="right">
      <button mat-icon-button [disableRipple]="true" color="accent">
        <app-icon [path]="icons.volumeHigh"></app-icon>
      </button>
      <button mat-icon-button [disableRipple]="true" color="accent">
        <app-icon [path]="icons.repeat"></app-icon>
      </button>
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        (click)="shuffle()"
      >
        <app-icon [path]="icons.shuffle"></app-icon>
      </button>
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        class="menu"
        (click)="toggleMenu()"
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
        height: 72px;
        position: relative;
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
      :host mat-slider {
        position: absolute;
        top: -15px;
        width: calc(100% - 12px);
        padding: 0;
        height: 32px;
        cursor: pointer;
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
        padding: 8px;
        box-sizing: content-box;
      }
      .time {
        color: rgb(170, 170, 170);
        font-size: 12px;
        display: inline-block;
        width: 71px;
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
      }
      .meta {
        display: flex;
        flex-direction: column;
        margin: 0 8px 0 16px;
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
      .controls {
      }
      .right {
        margin-left: auto;
      }
      .right button {
        margin-right: 8px;
        color: #aaa;
      }
      .right .menu {
        color: white;
      }
      .menu app-icon {
        transition: transform 300ms ease;
      }
      .menu app-icon.up {
        transform: rotate(180deg);
        transform-origin: center center;
      }
      a[href] {
        text-decoration: none;
      }
      a[href]:hover {
        text-decoration: underline;
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
  currentSong$!: Observable<SongWithCover$>;
  menuItems!: MenuItem[];
  playing$!: Observable<{ value: boolean }>;
  nextEnabled$!: Observable<boolean>;
  prevEnabled$!: Observable<boolean>;

  isPlayRoute!: boolean;

  subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private library: LibraryFacade,
    private player: PlayerFacade,
    private helper: ComponentHelperService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const r1$ = this.router.events
      .pipe(
        filter(
          (event): event is ActivationStart => event instanceof ActivationStart
        ),
        filter((event) => event.snapshot.outlet === 'primary'),
        tap(
          (event) => (this.isPlayRoute = event.snapshot.url[0]?.path === 'play')
        ),
        tap(() => this.cdr.markForCheck())
      )
      .subscribe();

    this.subscription.add(r1$);

    this.isPlayRoute =
      this.route.snapshot.parent?.firstChild?.url[0]?.path === 'play';

    const input$ = this.seeker.input.asObservable().pipe(shareReplay(1));
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

    this.seekerDisabled$ = this.player
      .getDuration$()
      .pipe(map((duration) => duration === 0));

    this.currentSong$ = this.player
      .getCurrentSong$()
      .pipe(filter((song): song is SongWithCover$ => !!song));

    this.currentSong$.pipe(tap((song) => this.updateMenu(song))).subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  seek(n: MatSliderChange) {
    if (n.value !== null) {
      this.player.seek(n.value);
    }
  }

  resume() {
    this.player.resume();
  }

  pause() {
    this.player.pause();
  }

  playNextSong() {
    this.player.setNextIndex();
  }

  playPreviousSong() {
    this.player.setPrevIndex();
  }

  shuffle() {
    this.player.setCurrentIndex(0);
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

  getHash(s: string) {
    return hash(s);
  }

  toggleLiked(song: SongWithCover$): void {
    this.helper.toggleLikedSong(song).subscribe(() => {
      this.updateMenu(song);
      this.cdr.markForCheck();
    });
  }

  updateMenu(song: SongWithCover$) {
    this.menuItems = [
      {
        text: 'Play next',
        icon: this.icons.playlistPlay,
        click: () => this.helper.playNext(song),
      },
      {
        text: 'Add to queue',
        icon: this.icons.playlistMusic,
        click: () => this.helper.addToQueue(song),
      },
      {
        text: !!song.likedOn ? 'Remove from your likes' : 'Add to your likes',
        icon: !!song.likedOn ? this.icons.heart : this.icons.heartOutline,
        click: () =>
          this.helper.toggleLikedSong(song).subscribe(() => {
            this.updateMenu(song);
            this.cdr.markForCheck();
          }),
      },
      {
        text: 'Add to playlist',
        icon: this.icons.playlistPlus,
        click: () => this.helper.addSongsToPlaylist([song]).subscribe(),
      },
      {
        text: 'Remove from queue',
        icon: this.icons.minusCircleOutline,
        click: () => this.helper.removeFromQueue(song),
      },
      {
        text: 'Go to album',
        icon: this.icons.album,
        routerLink: song.album
          ? ['/album', this.getHash(song.album)]
          : undefined,
      },
      {
        text: 'Go to artist',
        icon: this.icons.accountMusic,
        routerLink: song.artist
          ? ['/artist', this.getHash(song.artist)]
          : undefined,
      },
    ];
  }
}