import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `
    <svg
      viewBox="0 0 24 24"
      [ngStyle]="{ width: fullWidth ? '100%' : size + 'px' }"
    >
      <path [attr.d]="path" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
      }
      svg {
        display: inline-block;
      }
      path {
        fill: currentColor;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  @Input() path!: string;
  @Input() size = 24;
  @Input() fullWidth?: boolean;
}
