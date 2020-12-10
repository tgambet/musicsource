import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Icons } from '../utils/icons.util';

@Component({
  selector: 'app-menu',
  template: `
    <button mat-icon-button [matMenuTriggerFor]="menu">
      <app-icon [path]="triggerIcon"></app-icon>
    </button>
    <mat-menu #menu="matMenu">
      <ng-template matMenuContent>
        <button
          mat-menu-item
          *ngFor="let item of menuItems"
          (click)="item.click ? item.click() : undefined"
          [disabled]="item.disabled"
        >
          <app-icon *ngIf="item.icon" [path]="item.icon"></app-icon>
          <span>{{ item.text }}</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        display: block;
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
  icons = Icons;
}

export interface MenuItem {
  icon?: string;
  text: string;
  disabled?: boolean;
  click?: () => void;
}
