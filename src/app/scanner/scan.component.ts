import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  animationFrameScheduler,
  auditTime,
  combineLatest,
  Observable,
  scan,
} from 'rxjs';
import { Icons } from '@app/core/utils/icons.util';
import { ScannerFacade } from '@app/scanner/store/scanner.facade';
import { map } from 'rxjs/operators';

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
          [diameter]="50"
          [strokeWidth]="4"
          [value]="
            scanner.state === 'saving' ? scanner.saveProgress : scanner.progress
          "
          mode="determinate"
          color="accent"
        ></mat-spinner>
        <div class="label">
          <span class="progress-display">
            {{ scanner.progress | number: '1.0-0' }}%
          </span>
          <!--          <span class="progress-display" *ngIf="scanner.state === 'extracting'">-->
          <!--            {{ scanner.progress | number: '1.0-0' }}%-->
          <!--          </span>-->
          <!--          <span class="progress-display" *ngIf="scanner.state === 'scanning'">-->
          <!--            - -->
          <!--          </span>-->
          <!--          <span class="progress-display-sub">-->
          <!--            {{ scanner.progressDisplaySub }}-->
          <!--          </span>-->
        </div>
        <!--        <ng-template #temp>-->
        <!--          <div class="label" *ngIf="scanner.state === 'success'">-->
        <!--            <app-icon [path]="icons.check" [size]="40"></app-icon>-->
        <!--          </div>-->
        <!--          <div class="label" *ngIf="scanner.state === 'error'">-->
        <!--            <app-icon [path]="icons.close" [size]="40"></app-icon>-->
        <!--          </div>-->
        <!--        </ng-template>-->
      </div>
      <div class="labels">
        <p class="step">
          {{ scanner.state }}...
          <em>{{ scanner.extractedCount }}/{{ scanner.extractingCount }}</em>
          <em>{{ scanner.savedCount }}/{{ scanner.savingCount }}</em>
        </p>
        <p class="step-sub">
          {{ scanner.label }}
        </p>
      </div>

      <div class="actions">
        <button
          mat-raised-button
          color="warn"
          *ngIf="scanner.state === 'scanning' || scanner.state === 'extracting'"
          (click)="abort()"
        >
          ABORT
        </button>
        <button
          mat-raised-button
          [color]="scanner.state === 'success' ? 'accent' : 'warn'"
          *ngIf="scanner.state !== 'scanning' && scanner.state !== 'extracting'"
          (click)="close()"
        >
          CLOSE
        </button>
      </div>
    </div>
    <!--</ng-template>-->
  `,
  styles: [
    `
      :host {
        width: 100%;
        background-color: #212121;
        border-radius: 4px;
      }
      .container {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 16px;
      }
      .actions {
        /*align-self: flex-end;
        margin-left: auto;*/
      }
      .progress-display {
        font-size: 12px;
        opacity: 0.5;
      }
      .labels {
        flex: 1 1 auto;
        overflow: hidden;
        margin: 0 16px;
      }
      .step {
        margin: 0;
        display: flex;
        align-items: baseline;
      }
      .step em {
        font-style: normal;
        font-size: 14px;
        font-weight: 300;
        opacity: 0.5;
        margin-left: auto;
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
    state?: 'idle' | 'scanning' | 'extracting' | 'saving' | 'success' | 'error';
    error?: any;
    label?: string;
    progress?: number;
    saveProgress?: number;
    scannedCount: number;
    extractedCount: number;
    extractingCount: number;
    savedCount: number;
    savingCount: number;
  }>;

  constructor(private scanner: ScannerFacade) {
    // const throttle = <T>() =>
    //   throttleTime<T>(25, animationFrameScheduler, {
    //     leading: true,
    //     trailing: true,
    //   });

    const obs = {
      state: scanner.state$,
      error: scanner.error$,
      label: scanner.label$,
      progress: combineLatest([
        scanner.extractProgress$,
        scanner.saveProgress$,
      ]).pipe(
        map(([extract, save]) =>
          save > 0 ? Math.min(extract, save) : extract
        ),
        scan((acc, value) => (value > acc ? value : acc), 0)
      ),
      saveProgress: scanner.saveProgress$,
      scannedCount: scanner.scannedCount$,
      extractedCount: scanner.extractedCount$,
      extractingCount: scanner.extractingCount$,
      savedCount: scanner.savedCount$,
      savingCount: scanner.savingCount$,
    };

    this.scanner$ = combineLatest(obs).pipe(
      auditTime(1, animationFrameScheduler)
    );
  }

  close(): void {
    // this.dialogRef.close();
  }

  abort(): void {
    this.scanner.abort();
  }
}
