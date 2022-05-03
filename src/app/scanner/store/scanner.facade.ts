import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectError,
  selectLabel,
  selectState,
} from '@app/scanner/store/scanner.selectors';
import {
  scanEnd,
  scanStart,
  setLabel,
} from '@app/scanner/store/scanner.actions';

@Injectable()
export class ScannerFacade {
  error$ = this.store.select(selectError);
  state$ = this.store.select(selectState);
  label$ = this.store.select(selectLabel);

  constructor(private store: Store) {}

  start(): void {
    this.store.dispatch(scanStart());
  }

  abort(): void {
    this.store.dispatch(scanEnd());
  }

  setLabel(label: string): void {
    this.store.dispatch(setLabel({ label }));
  }
}
