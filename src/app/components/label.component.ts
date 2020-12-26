import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

export interface Link {
  text: string;
  routerLink: any[] | string;
}

@Component({
  selector: 'app-label',
  template: `
    <p class="top" [ngClass]="[size]">
      <a
        *ngIf="asLink(topLabel); let label; else: topText"
        [routerLink]="label.routerLink"
      >
        {{ label.text }}
      </a>
      <ng-template #topText>
        <span>{{ topLabel }}</span>
      </ng-template>
    </p>
    <p class="bottom" [ngClass]="[size]">
      <ng-container *ngIf="asArray(bottomLabel); let labels">
        <ng-container *ngFor="let label of labels; let last = last">
          <a
            *ngIf="asLink(label); let label; else: labelText"
            [routerLink]="label.routerLink"
          >
            {{ label.text }}
          </a>
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
      .large {
        font-size: 16px;
        line-height: 19px;
      }
      .small {
        font-size: 14px;
        line-height: 17px;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
  @Input() topLabel!: string | Link;
  @Input() bottomLabel!: string | Link | (string | Link)[];
  @Input() size: 'small' | 'large' = 'large';

  @HostBinding('class')
  @Input()
  align: 'left' | 'center' = 'left';

  asArray(val: string | Link | (string | Link)[]): (string | Link)[] {
    return Array.isArray(val) ? (val as Link[]).filter((a) => a) : [val];
  }

  asLink(val: string | Link): false | Link {
    return typeof val !== 'string' ? (val as Link) : false;
  }
}
