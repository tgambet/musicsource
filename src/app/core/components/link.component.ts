import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-link',
  template: `
    <button mat-button [routerLink]="link" [preserveFragment]="true">
      <ng-content></ng-content>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      button {
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.7);
        padding-left: 8px;
        padding-right: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent {
  @Input() link: any[] | string | undefined | null;
}
