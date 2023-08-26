import { ApplicationRef, Inject, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { concatMap, filter, first, tap } from 'rxjs/operators';
import { interval } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class UpdateService {
  constructor(
    private appRef: ApplicationRef,
    private updates: SwUpdate,
    private snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  register(): void {
    this.updates.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'),
        concatMap(() =>
          this.snackBar
            .open('A new version is available.', 'Reload', {
              duration: Infinity,
            })
            .afterDismissed(),
        ),
        tap(() =>
          this.updates.activateUpdate().then(() => document.location.reload()),
        ),
      )
      .subscribe();

    this.appRef.isStable
      .pipe(
        first((isStable) => isStable),
        concatMap(() => interval(60 * 60 * 1000)), // 1 hour
        tap(() => this.updates.checkForUpdate()),
      )
      .subscribe();
  }
}
