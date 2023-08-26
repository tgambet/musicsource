import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { Icons } from '@app/core/utils';
import { MatLegacyMenu as MatMenu } from '@angular/material/legacy-menu';

@Component({
  selector: 'app-menu',
  template: `
    <button
      class="trigger"
      [matMenuTriggerFor]="menu"
      #trigger="matMenuTrigger"
      (click)="$event.stopPropagation()"
      aria-label="menu"
      title="Other actions"
      matRipple
      [matRippleColor]="rippleColor"
      [matRippleCentered]="true"
      [matRippleDisabled]="disableRipple"
      [disabled]="disabled"
    >
      <app-icon [path]="triggerIcon" [size]="24"></app-icon>
    </button>
    <mat-menu #menu="matMenu" [overlapTrigger]="true">
      <ng-template matMenuContent>
        <ng-container *ngFor="let item of menuItems">
          <button
            mat-menu-item
            (click)="item.click ? item.click() : undefined"
            [disabled]="item.disabled"
            *ngIf="item.routerLink"
            [routerLink]="item.routerLink"
            [class]="item.color"
          >
            <app-icon
              *ngIf="item.icon"
              [path]="item.icon"
              [size]="24"
            ></app-icon>
            <span>{{ item.text }}</span>
          </button>
          <button
            mat-menu-item
            (click)="item.click ? item.click() : undefined"
            [disabled]="item.disabled"
            *ngIf="!item.routerLink"
            [class]="item.color"
          >
            <app-icon
              *ngIf="item.icon"
              [path]="item.icon"
              [size]="24"
            ></app-icon>
            <span>{{ item.text }}</span>
          </button>
        </ng-container>
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
        color: inherit;
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

      .mat-menu-item:not(.red) app-icon {
        opacity: 0.5;
      }

      .red {
        color: #d06969;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @ViewChild(MatMenu)
  matMenu!: MatMenu;

  @Input() disabled = false;
  @Input() hasBackdrop = true;
  @Input() triggerIcon = Icons.dotsVertical;
  @Input() menuItems!: MenuItem[] | null;
  @Input() disableRipple = false;
  @Input() rippleColor = 'rgba(255, 255, 255, 0.1)';
  icons = Icons;

  @HostListener('window:scroll')
  closeMenu(): void {
    this.matMenu.closed.emit();
  }
}

export interface MenuItem {
  icon?: string;
  text: string;
  disabled?: boolean;
  click?: () => void;
  routerLink?: string | any[];
  color?: string;
}
