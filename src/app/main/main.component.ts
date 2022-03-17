import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  NgZone,
  OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  animate,
  AnimationTriggerMetadata,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ScrollerService } from '@app/main/scroller.service';
import { Observable } from 'rxjs';
import { PlayerFacade } from '@app/player/store/player.facade';
import { Store } from '@ngrx/store';
import { loadAlbums } from '@app/database/albums/album.actions';
import { AlbumFacade } from '@app/database/albums/album.facade';
import { loadArtists } from '@app/database/artists/artist.actions';
import { loadSongs } from '@app/database/songs/song.actions';
import { loadPlaylists } from '@app/database/playlists/playlist.actions';
import { loadEntries } from '@app/database/entries/entry.actions';
import { loadPictures } from '@app/database/pictures/picture.actions';
import { first, tap } from 'rxjs/operators';
import { NavigationService } from '@app/main/navigation.service';

// export const debugAnimation = (name: string) => (
//   from: any,
//   to: any,
//   el: any,
//   params: any
// ) => {
//   console.log('ANIMATION (' + name + '):', from, '=>', to, el, params);
//   return false;
// };

export const playerAnimation: AnimationTriggerMetadata = trigger(
  'playerAnimations',
  [
    transition(':enter', [
      style({
        transform: 'translateY(72px)',
      }),
      animate('300ms ease-out', style({ transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      style({
        transform: 'translateY(0)',
      }),
      animate('300ms ease-out', style({ transform: 'translateY(72px)' })),
    ]),
  ]
);

export const slideInAnimation: AnimationTriggerMetadata = trigger(
  'routeAnimations',
  [
    // transition(debugAnimation('main'), []),
    transition('void <=> *', []),
    transition('null <=> *', []),
    transition('* => PlayPage', [
      style({ position: 'relative' }),
      query(':enter', [
        style({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'calc(100% - 136px)',
          zIndex: 200,
          transform: 'translateY(100vh)',
        }),
      ]),
      query(':enter', [
        animate('300ms ease-out', style({ transform: 'translateY(64px)' })),
      ]),
      query('router-outlet ~ *', [style({}), animate(1, style({}))], {
        optional: true,
      }),
    ]),
    transition('PlayPage => *', [
      style({ position: 'relative' }),
      query(':leave', [
        style({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 'calc(100% - 136px)',
          zIndex: 200,
          transform: 'translateY(64px)',
        }),
      ]),
      query(':leave', [
        animate('300ms ease-out', style({ transform: 'translateY(100vh)' })),
      ]),
      query('router-outlet ~ *', [style({}), animate(1, style({}))], {
        optional: true,
      }),
    ]),
  ]
);

@Component({
  selector: 'app-main',
  template: `
    <app-top-bar></app-top-bar>
    <main [@routeAnimations]="prepareRoute(outlet)">
      <router-outlet #outlet="outlet"></router-outlet>
    </main>
    <aside @playerAnimations *ngIf="showPlayer$ | async">
      <app-player></app-player>
    </aside>
    <router-outlet name="help"></router-outlet>
    <router-outlet name="feedback"></router-outlet>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
      }
      app-top-bar {
        flex: 0 0 64px;
      }
      main {
        flex: 1 1 auto;
        padding-bottom: 66px;
        display: flex;
        flex-direction: column;
      }
      @media (min-width: 950px) {
        main {
          padding-bottom: 72px;
        }
      }
      aside {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100vw;
        box-sizing: border-box;
        z-index: 500;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideInAnimation, playerAnimation],
})
export class MainComponent implements OnInit {
  @HostBinding('class.scrolled-top')
  scrolledTop = true;
  @HostBinding('class.with-background')
  withBackground = false;

  showPlayer$: Observable<boolean> = this.player.isShown$();

  constructor(
    private scroller: ScrollerService,
    private player: PlayerFacade,
    private albums: AlbumFacade,
    private store: Store,
    private appRef: ApplicationRef,
    private zone: NgZone,
    private navigator: NavigationService
  ) {}

  // @HostListener('window:scroll', ['$event'])
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  // setScrolledTop(event: any): void {
  //   this.scroller.scroll$.next(event.target.scrollingElement.scrollTop);
  //   this.scrolledTop = event.target.scrollingElement.scrollTop === 0;
  // }

  ngOnInit(): void {
    this.appRef.isStable
      .pipe(
        first((isStable) => isStable),
        tap(() => {
          this.zone.run(() => {
            this.store.dispatch(loadAlbums());
            this.store.dispatch(loadArtists());
            this.store.dispatch(loadEntries());
            this.store.dispatch(loadPlaylists());
            this.store.dispatch(loadSongs());
            this.store.dispatch(loadPictures());
          });
        })
      )
      .subscribe();

    // TODO
    this.scroller.scroll$.subscribe((top) => (this.scrolledTop = top === 0));
    // this.store.dispatch(loadPictures());
    // this.albums.getByYear(2020).subscribe((years) => console.log(years));

    this.navigator.register();
  }

  prepareRoute(outlet: RouterOutlet): string {
    const v =
      (outlet &&
        outlet.activatedRouteData &&
        outlet.activatedRouteData.animation) ||
      'null';
    if (v === 'PlayPage') {
      setTimeout(() => (this.withBackground = true));
    } else {
      setTimeout(() => (this.withBackground = false));
    }
    return v;
  }
}
