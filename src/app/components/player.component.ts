import {
  ChangeDetectionStrategy,
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
  take,
  tap,
} from 'rxjs/operators';
import { LibraryFacade } from '@app/store/library/library.facade';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { concat, merge, Observable, of, Subscription } from 'rxjs';
import { PlayerService } from '@app/services/player.service';
import { SongWithCover$ } from '@app/models/song.model';

export interface PlayerData {
  songs: SongWithCover$[];
  currentSong: SongWithCover$;
}

@Component({
  selector: 'app-player',
  template: `
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
      [disabled]="disabled$ | async"
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
        *ngIf="prevEnabled$ | async; else prevDisabled"
      >
        <app-icon [path]="icons.skipPrevious"></app-icon>
      </button>
      <ng-template #prevDisabled>
        <button mat-icon-button [disabled]="true" color="accent">
          <app-icon [path]="icons.skipPrevious"></app-icon>
        </button>
      </ng-template>
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        *ngIf="playing$ | async as playing; else disabledPlay"
        (click)="playing.value ? pause() : resume()"
      >
        <app-icon
          [path]="playing.value ? icons.pause : icons.play"
          [size]="40"
        ></app-icon>
      </button>
      <ng-template #disabledPlay>
        <button
          mat-icon-button
          [disableRipple]="false"
          color="accent"
          (click)="playCurrent()"
        >
          <app-icon [path]="icons.play" [size]="40"></app-icon>
        </button>
      </ng-template>
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        (click)="playNextSong()"
        *ngIf="nextEnabled$ | async; else nextDisabled"
      >
        <app-icon [path]="icons.skipNext"></app-icon>
      </button>
      <ng-template #nextDisabled>
        <button mat-icon-button [disabled]="true" color="accent">
          <app-icon [path]="icons.skipNext"></app-icon>
        </button>
      </ng-template>
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
          {{ song.artist }} • {{ song.album }} • {{ song.year }}
        </span>
      </div>
      <div class="controls">
        <button mat-icon-button [disableRipple]="true" color="accent">
          <app-icon [path]="icons.heartOutline"></app-icon>
        </button>
        <app-menu></app-menu>
      </div>
    </div>
    <div class="right">
      <button mat-icon-button [disableRipple]="true" color="accent">
        <app-icon [path]="icons.volumeHigh"></app-icon>
      </button>
      <button mat-icon-button [disableRipple]="true" color="accent">
        <app-icon [path]="icons.repeat"></app-icon>
      </button>
      <button mat-icon-button [disableRipple]="true" color="accent">
        <app-icon [path]="icons.shuffle"></app-icon>
      </button>
      <button
        mat-icon-button
        [disableRipple]="true"
        color="accent"
        class="menu"
        (click)="toggleMenu()"
      >
        <app-icon [path]="icons.menuUp" [size]="36"></app-icon>
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
        height: 100%;
        padding-right: 12px;
      }
      mat-slider {
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
  disabled$!: Observable<boolean>;
  currentSong$!: Observable<SongWithCover$>;
  playing$!: Observable<{ value: boolean }>;
  nextEnabled$!: Observable<boolean>;
  prevEnabled$!: Observable<boolean>;

  isPlayRoute!: boolean;

  subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private library: LibraryFacade,
    private player: PlayerService
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
        )
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
    this.nextEnabled$ = this.player.hasNextSong();
    this.prevEnabled$ = this.player.hasPreviousSong();

    this.disabled$ = concat(
      of(true),
      this.player.getDuration$().pipe(take(1), mapTo(false))
    );

    this.currentSong$ = this.player.currentSong$.pipe(
      filter((song): song is SongWithCover$ => !!song)
    );

    const data$ = this.route.data
      .pipe(
        tap((data) => this.player.setSongs(data.info.songs)),
        tap((data) => this.player.setCurrentSong(data.info.currentSong))
      )
      .subscribe();

    this.subscription.add(data$);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  seek(n: MatSliderChange) {
    if (n.value) {
      this.player.seek(n.value);
    }
  }

  pause() {
    this.player.pause();
  }

  async playNextSong() {
    const playing = await this.player.getPlaying$().pipe(take(1)).toPromise();
    await this.player.playNextSong().toPromise();
    if (playing) {
      await this.player.resume();
    }
  }

  async playPreviousSong() {
    const playing = await this.player.getPlaying$().pipe(take(1)).toPromise();
    await this.player.playPreviousSong().toPromise();
    if (playing) {
      await this.player.resume();
    }
  }

  async resume() {
    await this.player.resume();
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

  async playCurrent() {
    console.log('cu');
    await this.player.playCurrent();
  }
}
