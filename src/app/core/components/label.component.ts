import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';

export interface Link {
  text: string;
  routerLink: any[] | string;
}

export type BottomLabel =
  | undefined
  | string
  | Link
  | (undefined | string | Link)[];

@Component({
  selector: 'app-label',
  template: `
    <p class="top" [ngClass]="[size]">
      <a
        *ngIf="asLink(topLabel); let label; else: topText"
        [routerLink]="label.routerLink"
        (mousedown)="$event.stopPropagation()"
      >
        {{ label.text }}
      </a>
      <ng-template #topText>
        <span
          (click)="topLabelClick.emit()"
          [class.cursor]="topLabelClickable"
          >{{ topLabel }}</span
        >
      </ng-template>
    </p>
    <p class="bottom" [ngClass]="[size]">
      <ng-container *ngIf="asArray(bottomLabel); let labels">
        <ng-container *ngFor="let label of labels; let last = last">
          <a
            *ngIf="asLink(label); let label; else: labelText"
            [routerLink]="label.routerLink"
            (mousedown)="$event.stopPropagation()"
            >{{ label.text }}</a
          >
          <ng-template #labelText>
            <span>{{ label }}</span>
          </ng-template>
          <ng-container *ngIf="!last">
            <span class="separator"> • </span>
          </ng-container>
        </ng-container>
      </ng-container>
    </p>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      :host.center p {
        justify-content: center;
      }

      .large.top {
        max-height: 38px;
      }
      .small.top {
        max-height: 34px;
      }
      .top {
        margin-bottom: 3px;
        font-weight: 500;
        overflow-y: hidden;
      }
      .bottom {
        color: #aaa;
        font-weight: 400;
      }
      a {
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      .cursor {
        cursor: pointer;
      }
      .large {
        font-size: 14px;
        line-height: 17px;
      }
      .small {
        font-size: 12px;
        line-height: 15px;
      }
      @media (min-width: 1290px) {
        .large {
          font-size: 16px;
          line-height: 19px;
        }
        .small {
          font-size: 14px;
          line-height: 17px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
  @Input() topLabel!: undefined | string | Link;
  @Input() topLabelClickable = false;
  @Output() topLabelClick = new EventEmitter<void>();

  @Input() bottomLabel?: BottomLabel;
  @Input() size: 'small' | 'large' = 'large';

  @HostBinding('class')
  @Input()
  align: 'left' | 'center' = 'left';

  asArray(val: BottomLabel): (string | Link)[] {
    return Array.isArray(val)
      ? (val as Link[]).filter((a) => a)
      : val
      ? [val]
      : [];
  }

  asLink(val: undefined | string | Link): false | Link {
    if (!val) {
      return false;
    }
    return typeof val !== 'string' ? (val as Link) : false;
  }
}
