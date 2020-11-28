import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

export interface Label {
  text: string;
  routerLink: any[] | string;
}

@Component({
  selector: 'app-label',
  template: `
    <p class="top">
      <a
        *ngIf="topLabel.routerLink; else topText"
        [routerLink]="topLabel.routerLink"
      >
        {{ topLabel.text }}
      </a>
      <ng-template #topText>
        <span>{{ topLabel }}</span>
      </ng-template>
    </p>
    <p class="bottom">
      <ng-container *ngIf="isArray(bottomLabel); else bottomText">
        <ng-container *ngFor="let label of bottomLabel; let last = last">
          <a
            *ngIf="label.routerLink; else labelText"
            [routerLink]="label.routerLink"
          >
            {{ label.text }}
          </a>
          <ng-template #labelText>
            <span>{{ label }}</span>
          </ng-template>
          <ng-container *ngIf="!last">
            <span class="separator">•</span>
          </ng-container>
        </ng-container>
      </ng-container>
      <ng-template #bottomText>
        <span>{{ bottomLabel }}</span>
      </ng-template>
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
      p {
        font-size: 16px;
        line-height: 19px;
        display: flex;
      }
      .top {
        margin-bottom: 3px;
        font-weight: 500;
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
      .separator {
        margin: 0 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabelComponent {
  @Input() topLabel!: string | Label;
  @Input() bottomLabel!: string | (string | Label)[];

  @HostBinding('class')
  @Input()
  align: 'left' | 'center' = 'left';

  isArray(val: unknown): boolean {
    return Array.isArray(val);
  }
}
