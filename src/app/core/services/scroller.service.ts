import { Injectable } from '@angular/core';
import { ReplaySubject, Subject } from 'rxjs';

@Injectable()
export class ScrollerService {
  scroll$ = new ReplaySubject<number>(1);
  topBarTop$ = new Subject<boolean>();

  constructor() {
    this.scroll$.next(0);
  }
}
