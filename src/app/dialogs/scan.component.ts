import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { asapScheduler, Observable } from 'rxjs';
import {
  ScannerStateEnum,
  selectError,
  selectLatestParsed,
  selectLatestScanned,
  selectParsedCount,
  selectProgressRatio,
  selectScannedCount,
  selectScannerState,
} from '@app/store/scanner';
import { Store } from '@ngrx/store';
import { map, throttleTime } from 'rxjs/operators';
import { RoutedDialogDirective } from '@app/directives/routed-dialog.directive';
import { abortScan } from '@app/store/scanner/scanner.actions';
import { Icons } from '@app/utils/icons.util';

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
          <p class="log">You can close this window</p>
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
  success = ScannerStateEnum.success;

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

  constructor(private store: Store) {
    const throttle = <T>() =>
      throttleTime<T>(32, asapScheduler, {
        leading: true,
        trailing: true,
      });

    this.scannerState$ = this.store.select(selectScannerState);
    this.scanned$ = this.store.select(selectScannedCount).pipe(throttle());
    this.parsed$ = this.store.select(selectParsedCount).pipe(throttle());
    this.progress$ = this.store.select(selectProgressRatio).pipe(
      map((ratio) => Math.ceil(ratio * 100)),
      throttle()
    );
    this.latestScanned$ = this.store
      .select(selectLatestScanned)
      .pipe(throttle());
    this.latestParsed$ = this.store.select(selectLatestParsed).pipe(throttle());
    this.error$ = this.store.select(selectError);
  }

  async close() {
    await this.dialog.close();
  }

  abort(): void {
    this.store.dispatch(abortScan());
  }
}
