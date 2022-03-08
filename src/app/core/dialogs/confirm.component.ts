import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Icons } from '@app/core/utils/icons.util';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmData {
  text: string;
  action: string;
}

@Component({
  selector: 'app-confirm',
  template: `
    <h1 mat-dialog-title>Please confirm</h1>
    <mat-dialog-content>
      <p>{{ data.text }}</p>
    </mat-dialog-content>
    <div class="dialog-actions">
      <button mat-button [mat-dialog-close]="false">Cancel</button>
      <button mat-raised-button [mat-dialog-close]="true" color="accent">
        {{ data.action }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .mat-dialog-container {
        padding-bottom: 0 !important;
      }
      .dialog-actions {
        text-align: right;
        margin: 0 -24px -24px;
        padding: 1em;
      }
      .mat-dialog-content {
        border-bottom: solid rgba(255, 255, 255, 0.1);
        border-width: 1px 0;
        padding: 0 24px 24px;
      }
      button {
        margin-left: 1em;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmComponent {
  icons = Icons;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmData) {}
}
