import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { Icons } from '@app/core/utils/icons.util';
import { ScannerFacade } from '@app/scanner/store/scanner.facade';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-scan',
  template: `
    <div class="container" *ngIf="scanner$ | async as scanner">
      <div class="progress">
        <mat-spinner
          [diameter]="50"
          [strokeWidth]="4"
          mode="indeterminate"
          color="accent"
        ></mat-spinner>
      </div>
      <div class="labels">
        <p class="step">{{ scanner.state | titlecase }}...</p>
        <p class="step-sub">
          {{ scanner.label }}
        </p>
      </div>

      <div class="actions">
        <button
          mat-raised-button
          color="warn"
          *ngIf="scanner.state === 'scanning'"
          (click)="abort()"
        >
          ABORT
        </button>
      </div>
    </div>
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
  icons = Icons;

  scanner$: Observable<{
    state: 'idle' | 'scanning' | 'success' | 'error';
    error: any;
    label: string;
  }>;

  constructor(private scanner: ScannerFacade) {
    this.scanner$ = combineLatest([
      scanner.state$,
      scanner.error$,
      scanner.label$,
    ]).pipe(map(([state, error, label]) => ({ state, error, label })));
  }

  abort(): void {
    this.scanner.abort();
  }
}
