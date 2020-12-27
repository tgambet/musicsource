import { ApplicationRef, Inject, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concatMapTo, first, tap } from 'rxjs/operators';
import { interval } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class UpdateService {
  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document
  ) {}

  register() {
    this.updates.available
      .pipe(
        concatMapTo(
          this.snackBar
            .open('A new version is available.', 'Reload')
            .afterDismissed()
        ),
        tap(() =>
          this.updates.activateUpdate().then(() => document.location.reload())
        )
      )
      .subscribe();

    this.appRef.isStable
      .pipe(
        first((isStable) => isStable),
        concatMapTo(interval(60 * 60 * 1000)), // 1 hour
        tap(() => this.updates.checkForUpdate())
      )
      .subscribe();
  }
}
