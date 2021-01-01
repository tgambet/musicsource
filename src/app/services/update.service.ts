import { ApplicationRef, Inject, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concatMap, first, tap } from 'rxjs/operators';
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
        concatMap(() =>
          this.snackBar
            .open('A new version is available.', 'Reload', {
              duration: Infinity,
            })
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
        concatMap(() => interval(60 * 60 * 1000)), // 1 hour
        tap(() => this.updates.checkForUpdate())
      )
      .subscribe();
  }
}
