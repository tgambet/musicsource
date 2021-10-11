import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Event, Router, Scroll } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <router-outlet name="dialog"></router-outlet>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100%;
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent {
  constructor(router: Router, viewportScroller: ViewportScroller) {
    router.events
      .pipe(filter((e: Event): e is Scroll => e instanceof Scroll))
      .subscribe((e) => {
        if (e.position && e.position[1] === 0) {
          viewportScroller.scrollToPosition([0, 0]);
        } else if (e.position) {
          // backward navigation
          const p = e.position;
          setTimeout(() => viewportScroller.scrollToPosition(p), 0);
          //
          // const getPos$ = defer(() => of(viewportScroller.getScrollPosition()));
          // const scroll$ = defer(() => of(viewportScroller.scrollToPosition(p)));
          //
          // timer(10)
          //   .pipe(
          //     publish((m$) =>
          //       merge(
          //         m$.pipe(
          //           concatMap(() =>
          //             fromEvent(window, 'scroll').pipe(
          //               debounceTime(100),
          //               first()
          //             )
          //           ),
          //           concatMap(() =>
          //             getPos$.pipe(
          //               concatMap((pos) =>
          //                 pos[1] === p[1]
          //                   ? EMPTY
          //                   : throwError('position not matching')
          //               )
          //             )
          //           )
          //         ),
          //         m$.pipe(concatMapTo(scroll$))
          //       )
          //     ),
          //     retry(10)
          //   )
          //   .subscribe();
        } else if (e.anchor) {
          // anchor navigation
          const anchor = e.anchor;
          setTimeout(() => viewportScroller.scrollToAnchor(anchor));
        } else {
          const a = [/library.+#top/, /\/play$/];
          // forward navigation
          if (!a.find((l) => l.test(e.routerEvent.url))) {
            viewportScroller.scrollToPosition([0, 0]);
          }
        }
      });
  }
}
