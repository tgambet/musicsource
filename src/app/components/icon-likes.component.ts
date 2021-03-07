import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Icons } from '@app/utils/icons.util';

@Component({
  selector: 'app-icon-likes',
  template: `
    <svg
      viewBox="0 0 24 24"
      [ngStyle]="{ width: fullWidth ? '100%' : size + 'px' }"
    >
      <path
        class="p1"
        [attr.d]="icons.heart"
        transform="translate(-10, -4) scale(0.9)"
      />
      <path
        class="p2"
        [attr.d]="icons.heart"
        transform="translate(-5, -2) scale(0.9)"
      />
      <path class="p3" [attr.d]="icons.heart" transform="scale(0.9)" />
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
        transform-origin: right bottom;
        mix-blend-mode: multiply;
      }
      .p1 {
        fill: #ee025c;
      }
      .p2 {
        fill: #c70056;
      }
      .p3 {
        fill: #8e004c;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLikesComponent {
  @Input() size = 160;
  @Input() fullWidth?: boolean;

  icons = Icons;
}
