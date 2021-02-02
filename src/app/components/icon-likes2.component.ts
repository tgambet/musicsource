import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Icons } from '@app/utils/icons.util';

@Component({
  selector: 'app-icon-likes2',
  template: `
    <svg
      viewBox="0 0 24 24"
      [ngStyle]="{ width: fullWidth ? '100%' : size + 'px' }"
    >
      <path
        class="p1"
        [attr.d]="icons.thumbUp"
        transform="translate(-10, 0) scale(0.6)"
      />
      <path
        class="p2"
        [attr.d]="icons.thumbUp"
        transform="translate(-5, 0) scale(0.6)"
      />
      <path class="p3" [attr.d]="icons.thumbUp" transform="scale(0.6)" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
        background-color: rgb(12, 69, 216);
      }

      svg {
        display: inline-block;
      }

      path {
        transform-origin: right center;
        mix-blend-mode: difference;
      }

      .p1 {
        fill: rgb(66, 65, 86);
      }

      .p2 {
        fill: rgb(59, 255, 41);
      }

      .p3 {
        fill: rgb(255, 169, 0);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconLikes2Component {
  @Input() size = 160;
  @Input() fullWidth?: boolean;

  icons = Icons;
}
