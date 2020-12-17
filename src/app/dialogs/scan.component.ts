import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { asapScheduler, Observable } from 'rxjs';
import { ScannerStateEnum } from '@app/store/scanner';
import { throttleTime } from 'rxjs/operators';
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
      <div class="container">
        <ng-container *ngIf="(scannerState$ | async) === scanning">
          <span class="step">1/3</span>
          <div class="progress">
            <mat-spinner [diameter]="90"></mat-spinner>
            <div class="label">
              <span>{{ scanned$ | async | number: '1.0-0' }}</span>
              <span class="sub">files</span>
            </div>
          </div>
          <p>Scanning...</p>
          <p class="log">{{ latestScanned$ | async }}</p>
        </ng-container>

        <ng-container *ngIf="(scannerState$ | async) === parsing">
          <span class="step">2/3</span>
          <div class="progress">
            <mat-progress-spinner
              [diameter]="90"
              mode="determinate"
              [value]="progress$ | async"
            ></mat-progress-spinner>
            <div class="label">
              <span>{{ progress$ | async | number: '1.0-0' }}%</span>
              <span class="sub small">
                {{ parsed$ | async | number: '1.0-0' }}/{{
                  scanned$ | async | number: '1.0-0'
                }}
              </span>
            </div>
          </div>
          <p>Building library...</p>
          <p class="log">{{ latestParsed$ | async }}</p>
        </ng-container>

        <ng-container *ngIf="(scannerState$ | async) === building">
          <span class="step">3/3</span>
          <div class="progress">
            <mat-progress-spinner
              [diameter]="90"
              mode="indeterminate"
            ></mat-progress-spinner>
            <div class="label">
              <app-icon [path]="icons.check" [size]="40"></app-icon>
            </div>
          </div>
          <p>Saving to database...</p>
          <p class="log"></p>
        </ng-container>

        <ng-container *ngIf="(scannerState$ | async) === success">
          <div class="progress">
            <mat-progress-spinner
              [diameter]="90"
              mode="determinate"
              [value]="100"
            ></mat-progress-spinner>
            <div class="label">
              <app-icon [path]="icons.check" [size]="40"></app-icon>
            </div>
          </div>
          <p>Library built</p>
          <p class="log">You can close this dialog</p>
        </ng-container>

        <ng-container *ngIf="(scannerState$ | async) === error">
          <div class="progress">
            <mat-progress-spinner
              [diameter]="90"
              mode="determinate"
              [value]="100"
              color="warn"
            ></mat-progress-spinner>
            <div class="label">
              <app-icon [path]="icons.close" [size]="40"></app-icon>
            </div>
          </div>
          <p>An error occurred</p>
          <p class="log">{{ error$ | async }}</p>
        </ng-container>

        <ng-container *ngIf="scannerState$ | async; let status">
          <div class="actions">
            <button
              mat-stroked-button
              [color]="status === success ? 'primary' : 'warn'"
              (click)="
                status === success || status === error ? close() : abort()
              "
            >
              {{ status === success || status === error ? 'Close' : 'Abort' }}
            </button>
          </div>
        </ng-container>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px;
        position: relative;
      }
      .step {
        position: absolute;
        top: 16px;
        left: 16px;
        font-size: 14px;
        opacity: 0.5;
      }
      .actions {
        align-self: flex-end;
        margin-top: 24px;
      }
      p {
        margin: 24px 0 0 0;
      }
      .log,
      .sub {
        font-size: 12px;
        line-height: 16px;
        height: 16px;
        opacity: 0.5;
        margin-top: 4px;
        font-weight: 300;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        box-sizing: border-box;
      }
      .small {
        font-size: 10px;
      }
      .log {
        margin-top: 8px;
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

  error = ScannerStateEnum.error;
  parsing = ScannerStateEnum.parsing;
  scanning = ScannerStateEnum.scanning;
  building = ScannerStateEnum.building;
  success = ScannerStateEnum.initial;

  config: MatDialogConfig = {
    width: '90%',
    maxWidth: '300px',
    hasBackdrop: true,
    disableClose: true,
    scrollStrategy: new NoopScrollStrategy(),
    closeOnNavigation: false,
  };

  scannerState$: Observable<ScannerStateEnum>;
  scanned$: Observable<number>;
  parsed$: Observable<number>;
  progress$: Observable<number>;
  latestScanned$: Observable<string | null>;
  latestParsed$: Observable<string | null>;
  error$: Observable<any | null>;

  constructor(private scanner: ScannerFacade) {
    const throttle = <T>() =>
      throttleTime<T>(32, asapScheduler, {
        leading: true,
        trailing: true,
      });

    this.scannerState$ = scanner.state$;
    this.scanned$ = scanner.scannedCount$.pipe(throttle());
    this.parsed$ = scanner.parsedCount$.pipe(throttle());
    this.progress$ = scanner.progress$.pipe(throttle());
    this.latestScanned$ = scanner.latestScanned$.pipe(throttle());
    this.latestParsed$ = scanner.latestParsed$.pipe(throttle());
    this.error$ = scanner.error$;
  }

  async close() {
    await this.dialog.close();
  }

  abort(): void {
    this.scanner.abort();
  }
}
