import { Injectable } from '@angular/core';
import {
  asapScheduler,
  distinctUntilChanged,
  fromEvent,
  Observable,
  ReplaySubject,
  share,
  startWith,
} from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

@Injectable()
export class ScrollerService {
  scroll$: Observable<number>;

  constructor() {
    this.scroll$ = fromEvent(window, 'scroll').pipe(
      throttleTime(10, asapScheduler, {
        leading: true,
        trailing: true,
      }),
      // debounceTime(25, animationFrameScheduler),
      map((event: any) => event.target.scrollingElement.scrollTop),
      distinctUntilChanged(),
      startWith(0),
      share({
        connector: () => new ReplaySubject(1),
        resetOnRefCountZero: true,
      }),
    );
  }
}
