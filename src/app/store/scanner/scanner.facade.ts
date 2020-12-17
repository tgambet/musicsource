import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectError,
  selectLatestParsed,
  selectLatestScanned,
  selectParsedCount,
  selectParsedEntries,
  selectProgress,
  selectProgressRatio,
  selectScannedCount,
  selectScannedEntries,
  selectScannerState,
} from '@app/store/scanner/scanner.selectors';
import { abortScan, openDirectory } from '@app/store/scanner/scanner.actions';

@Injectable()
export class ScannerFacade {
  error$ = this.store.select(selectError);
  state$ = this.store.select(selectScannerState);
  scannedCount$ = this.store.select(selectScannedCount);
  parsedCount$ = this.store.select(selectParsedCount);
  latestScanned$ = this.store.select(selectLatestScanned);
  latestParsed$ = this.store.select(selectLatestParsed);
  progressRatio$ = this.store.select(selectProgressRatio);
  progress$ = this.store.select(selectProgress);
  scannedEntries$ = this.store.select(selectScannedEntries);
  parsedEntries$ = this.store.select(selectParsedEntries);

  constructor(private store: Store) {}

  abort() {
    this.store.dispatch(abortScan());
  }

  openDirectory() {
    this.store.dispatch(openDirectory());
  }
}
