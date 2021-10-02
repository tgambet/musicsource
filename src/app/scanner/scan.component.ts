import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { asapScheduler, combineLatest, Observable } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';
import { Icons } from '@app/core/utils/icons.util';
import { ScannerFacade } from '@app/scanner/store/scanner.facade';

@Component({
  selector: 'app-scan',
  template: `
    <!--    <ng-template
      appRoutedDialog
      outlet="dialog"
      [config]="config"
      #dialog="appRoutedDialog"
    >-->
    <div class="container" *ngIf="scanner$ | async as scanner">
      <div class="progress">
        <mat-spinner
          [diameter]="100"
          [strokeWidth]="8"
          [value]="scanner.progress"
          [mode]="scanner.progress === 0 ? 'indeterminate' : 'determinate'"
          color="accent"
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
          mat-raised-button
          [color]="scanner.state === 'success' ? 'accent' : 'warn'"
          (click)="scanner.state === 'scanning' ? abort() : close()"
        >
          {{ scanner.state === 'scanning' ? 'Abort' : 'Close' }}
        </button>
      </div>
    </div>
    <!--</ng-template>-->
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
        margin-top: 6px;
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
  // @ViewChild('dialog')
  // dialog!: RoutedDialogDirective;

  icons = Icons;

  // config: MatDialogConfig = {
  //   width: '90%',
  //   maxWidth: '325px',
  //   hasBackdrop: true,
  //   disableClose: true,
  //   scrollStrategy: new NoopScrollStrategy(),
  //   closeOnNavigation: false,
  //   panelClass: 'scan-dialog',
  // };

  scanner$: Observable<{
    state?: 'scanning' | 'success' | 'error';
    error?: any;
    step?: string;
    stepSub?: string;
    progress?: number;
    progressDisplay?: string;
    progressDisplaySub?: string;
  }>;

  constructor(
    private scanner: ScannerFacade,
    public dialogRef: MatDialogRef<ScanComponent>
  ) {
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

  close(): void {
    this.dialogRef.close();
  }

  abort(): void {
    this.scanner.abort();
  }
}
