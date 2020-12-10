import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { PlayerState } from './player-button.component';
import { Icons } from '../utils/icons.util';
import { MenuItem } from './menu.component';

@Component({
  selector: 'app-cover',
  template: `
    <app-player-button
      cdkMonitorSubtreeFocus
      [ngClass]="playerState"
      [state]="playerState"
      size="small"
      (playClicked)="playClicked.emit()"
      (pauseClicked)="pauseClicked.emit()"
    ></app-player-button>
    <app-menu
      cdkMonitorSubtreeFocus
      [triggerIcon]="menuTriggerIcon"
      [menuItems]="menuItems"
    >
    </app-menu>
    <a
      matRipple
      class="link"
      [title]="title"
      [routerLink]="routerLink"
      tabindex="-1"
    >
      <div class="shadow"></div>
      <ng-content></ng-content>
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        border-radius: 4px;
      }
      a {
        display: block;
        text-decoration: none;
      }
      app-menu,
      app-player-button.stopped:not(.cdk-focused) {
        opacity: 0;
      }
      :host:hover app-menu,
      :host:hover app-player-button,
      app-menu.cdk-focused,
      app-player-button.cdk-focused {
        opacity: 1;
      }
      app-player-button {
        position: absolute;
        right: 16px;
        bottom: 16px;
        z-index: 1;
        transform: scale(0.8);
        transition: transform 0.2s ease, opacity 0.2s ease;
        border: 4px solid rgba(0, 0, 0, 0.25);
      }
      app-player-button:hover,
      app-player-button.cdk-focused {
        transform: scale(1);
        border: 4px solid rgba(0, 0, 0, 1);
        background-color: rgba(0, 0, 0, 0.75);
      }
      app-menu {
        position: absolute;
        right: 8px;
        top: 8px;
        z-index: 1;
        transition: opacity 0.2s ease;
      }
      .link {
        position: relative;
      }
      /*.link:focus {*/
      /*  outline: 2px solid white;*/
      /*  outline-offset: -2px;*/
      /*}*/
      .shadow {
        opacity: 0;
        position: absolute;
        z-index: 1;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.5),
          transparent 50%,
          transparent
        );
        transition: opacity 0.2s ease;
      }
      :host:hover .shadow {
        opacity: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverComponent {
  @Input() title!: string;
  @Input() playerState!: PlayerState;
  @Input() routerLink!: any[] | string;
  @Input() menuItems!: MenuItem[];
  @Input() menuTriggerIcon = Icons.dotsVertical;
  @Output() playClicked = new EventEmitter<void>();
  @Output() pauseClicked = new EventEmitter<void>();
}
