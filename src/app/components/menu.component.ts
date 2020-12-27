import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Icons } from '../utils/icons.util';

@Component({
  selector: 'app-menu',
  template: `
    <button
      class="trigger"
      [matMenuTriggerFor]="menu"
      aria-label="menu"
      title="Other actions"
      matRipple
      [matRippleColor]="rippleColor"
      [matRippleCentered]="true"
      [matRippleDisabled]="disableRipple"
    >
      <app-icon [path]="triggerIcon" [size]="24"></app-icon>
    </button>
    <mat-menu #menu="matMenu" [hasBackdrop]="true">
      <ng-template matMenuContent>
        <button
          mat-menu-item
          *ngFor="let item of menuItems"
          (click)="item.click ? item.click() : undefined"
          [disabled]="item.disabled"
          [routerLink]="item.routerLink"
        >
          <app-icon *ngIf="item.icon" [path]="item.icon" [size]="24"></app-icon>
          <span>{{ item.text }}</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .trigger {
        padding: 0;
        width: 40px;
        height: 40px;
        min-width: initial;
        border-radius: 50%;
        overflow: hidden;
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
      }
      .trigger app-icon {
        position: relative;
        z-index: 1;
      }
      .trigger:focus {
        outline: none;
      }
      .mat-menu-item app-icon {
        margin-right: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @Input() triggerIcon = Icons.dotsVertical;
  @Input() menuItems!: MenuItem[];
  @Input() disableRipple = false;
  @Input() rippleColor = 'rgba(255, 255, 255, 0.1)';
  icons = Icons;
}

export interface MenuItem {
  icon?: string;
  text: string;
  disabled?: boolean;
  click?: () => void;
  routerLink?: string | any[];
}
