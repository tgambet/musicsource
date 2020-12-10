import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import { concatMapTo, first, tap } from 'rxjs/operators';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  constructor(
    appRef: ApplicationRef,
    updates: SwUpdate,
    snackBar: MatSnackBar
  ) {
    updates.available
      .pipe(
        concatMapTo(
          snackBar
            .open('A new version is available.', 'Reload')
            .afterDismissed()
        ),
        tap(() =>
          updates.activateUpdate().then(() => document.location.reload())
        )
      )
      .subscribe();

    appRef.isStable
      .pipe(
        first((isStable) => isStable),
        concatMapTo(interval(60 * 60 * 1000)), // 1 hour
        tap(() => updates.checkForUpdate())
      )
      .subscribe();
  }
}
