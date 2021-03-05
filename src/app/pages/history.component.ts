import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-history',
  template: ` <p>history works!</p> `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryComponent {}
