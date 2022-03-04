import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Icons } from '@app/core/utils';
import { MenuItem } from './menu.component';
import { Song } from '@app/database/songs/song.model';

@Component({
  selector: 'app-cover',
  template: `
    <app-player-button
      cdkMonitorSubtreeFocus
      size="small"
      [song]="song"
      [playlist]="playlist"
      [playlistMode]="true"
      (playlistPlayed)="playlistPlayed.emit()"
      spinnerPosition="outside"
      *ngIf="song && playlist"
    ></app-player-button>
    <app-menu
      cdkMonitorSubtreeFocus
      [triggerIcon]="menuTriggerIcon"
      [menuItems]="menuItems"
      rippleColor="rgba(0,0,0,0.2)"
    >
    </app-menu>
    <a
      matRipple
      class="link"
      [title]="title"
      [routerLink]="coverRouterLink"
      tabindex="-1"
      style="--aspect-ratio:1"
    >
      <div class="content">
        <ng-content></ng-content>
      </div>
      <div class="shadow"></div>
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
      app-menu {
        /* background-color: rgba(0, 0, 0, 0.5); */
        border-radius: 50%;
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
        transition: transform 0.2s ease, opacity 0.2s ease,
          background-color 0.2s ease;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.75);
      }
      app-player-button:hover,
      app-player-button.cdk-focused {
        transform: scale(1.2);
        background-color: rgba(0, 0, 0, 1);
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
      .content {
        position: absolute;
        /*top: 50%;*/
        /*transform: translateY(-50%);*/
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverComponent {
  @Input() song!: Song | null | undefined;
  @Input() playlist!: Song[] | null | undefined;
  @Input() title!: string;
  @Input() coverRouterLink!: any[] | string;
  @Input() menuItems!: MenuItem[];
  @Input() menuTriggerIcon = Icons.dotsVertical;
  @Output() playlistPlayed = new EventEmitter<void>();
}
