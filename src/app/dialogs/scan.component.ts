import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { asapScheduler, combineLatest, Observable } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';
import { RoutedDialogDirective } from '@app/directives/routed-dialog.directive';
import { Icons } from '@app/utils/icons.util';
import { ScannerFacade } from '@app/store/scanner/scanner.facade';

@Component({
  selector: 'app-scan',
  template: `
    <ng-template
      appRoutedDialog
      outlet="dialog"
      [config]="config"
      #dialog="appRoutedDialog"
    >
      <div class="container" *ngIf="scanner$ | async as scanner">
        <div class="progress">
          <mat-spinner
            [diameter]="95"
            [strokeWidth]="8"
            [value]="scanner.progress"
            [mode]="scanner.progress === 0 ? 'indeterminate' : 'determinate'"
          ></mat-spinner>
          <div class="label" *ngIf="scanner.progressDisplay; else temp">
            <span class="progress-display">
              {{ scanner.progressDisplay }}
            </span>
            <span class="progress-display-sub">
              {{ scanner.progressDisplaySub }}
            </span>
          </div>
          <ng-template #temp>
            <div class="label" *ngIf="scanner.state === 'success'">
              <app-icon [path]="icons.check" [size]="40"></app-icon>
            </div>
            <div class="label" *ngIf="scanner.state === 'error'">
              <app-icon [path]="icons.close" [size]="40"></app-icon>
            </div>
          </ng-template>
        </div>
        <p class="step">{{ scanner.step }}</p>
        <p class="step-sub">{{ scanner.stepSub }}</p>

        <div class="actions">
          <button
            mat-stroked-button
            [color]="scanner.state === 'success' ? 'primary' : 'warn'"
            (click)="scanner.state === 'scanning' ? abort() : close()"
          >
            {{ scanner.state === 'scanning' ? 'Abort' : 'Close' }}
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 32px 24px 24px;
      }
      .actions {
        align-self: flex-end;
        margin-top: 24px;
      }
      .step {
        margin: 24px 0 0 0;
      }
      .step-sub,
      .progress-display-sub {
        font-size: 12px;
        line-height: 16px;
        height: 16px;
        opacity: 0.5;
        margin-top: 2px;
        font-weight: 300;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        box-sizing: border-box;
      }
      .step-sub {
        margin-top: 12px;
      }
      .progress {
        position: relative;
      }
      .label {
        text-align: center;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanComponent {
  @ViewChild('dialog')
  dialog!: RoutedDialogDirective;

  icons = Icons;

  config: MatDialogConfig = {
    width: '90%',
    maxWidth: '325px',
    hasBackdrop: true,
    disableClose: true,
    scrollStrategy: new NoopScrollStrategy(),
    closeOnNavigation: false,
  };

  scanner$: Observable<any>;

  constructor(private scanner: ScannerFacade) {
    const throttle = <T>() =>
      throttleTime<T>(25, asapScheduler, {
        leading: true,
        trailing: true,
      });

    this.scanner$ = combineLatest([
      scanner.state$,
      scanner.error$,
      scanner.step$,
      scanner.stepSub$,
      scanner.progress$,
      scanner.progressDisplay$,
      scanner.progressDisplaySub$,
    ]).pipe(
      throttle(),
      map(
        ([
          state,
          error,
          step,
          stepSub,
          progress,
          progressDisplay,
          progressDisplaySub,
        ]) => ({
          state,
          error,
          step,
          stepSub,
          progress,
          progressDisplay,
          progressDisplaySub,
        })
      )
    );
  }

  async close() {
    await this.dialog.close();
  }

  abort(): void {
    this.scanner.abort();
  }
}
