import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { ExtractorService } from '@app/services/extractor.service';
import { FileService } from '@app/services/file.service';
import { RouterOutlet } from '@angular/router';
import {
  animate,
  AnimationTriggerMetadata,
  query,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ScrollerService } from '@app/services/scroller.service';
import { Observable } from 'rxjs';
import { PlayerFacade } from '@app/store/player/player.facade';

export const debugAnimation = (name: string) => (
  from: any,
  to: any,
  el: any,
  params: any
) => {
  console.log('ANIMATION (' + name + '):', from, '=>', to, el, params);
  return false;
};

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
          height: 'calc(100% - 136px)',
          width: '100vw',
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
          height: 'calc(100% - 136px)',
          width: '100vw',
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
  selector: 'app-app',
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
        min-height: 100%;
      }
      app-top-bar {
        flex: 0 0 64px;
      }
      main {
        flex: 1 1 auto;
        padding-bottom: 72px;
        display: flex;
        flex-direction: column;
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
  providers: [FileService, ExtractorService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideInAnimation, playerAnimation],
})
export class AppComponent implements OnInit {
  @HostBinding('class.scrolled-top')
  scrolledTop = true;
  @HostBinding('class.with-background')
  withBackground = false;

  showPlayer$: Observable<boolean> = this.player.isShown$();

  constructor(
    private scroller: ScrollerService,
    private player: PlayerFacade
  ) {}

  @HostListener('window:scroll', ['$event'])
  setScrolledTop(event: any) {
    this.scroller.scroll$.next(event.target.scrollingElement.scrollTop);
    this.scrolledTop = event.target.scrollingElement.scrollTop === 0;
  }

  ngOnInit(): void {}

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
