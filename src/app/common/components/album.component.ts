import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Optional,
  ChangeDetectorRef,
} from '@angular/core';
import { Icons } from '../icons';

@Component({
  selector: 'app-album',
  template: `
    <div class="image" [ngClass]="state">
      <app-menu
        cdkMonitorSubtreeFocus
        [triggerIcon]="icons.dotsVertical"
        [menuItems]="menuItems"
      >
      </app-menu>
      <app-player-button
        cdkMonitorSubtreeFocus
        [state]="state"
        size="small"
        (playClicked)="play()"
        (pauseClicked)="pause()"
      ></app-player-button>
      <a class="link" [routerLink]="routerLink" matRipple [title]="name">
        <div class="shadow"></div>
        <img
          [src]="cover"
          [alt]="name"
          aria-hidden="true"
          height="226"
          width="226"
        />
      </a>
    </div>
    <app-label
      [topLabel]="{ text: name, routerLink: routerLink }"
      [bottomLabel]="['Album', { text: artist, routerLink: artistRouterLink }]"
    ></app-label>
  `,
  styles: [
    `
      :host {
        position: relative;
      }
      :host,
      a,
      img {
        display: block;
      }
      .image {
        margin-bottom: 16px;
        overflow: hidden;
        border-radius: 4px;
        position: relative;
      }
      app-menu,
      .stopped app-player-button:not(.cdk-focused) {
        opacity: 0;
      }
      .image:hover app-menu,
      .image:hover app-player-button,
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
      .image:hover .shadow {
        opacity: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumComponent {
  @Input() name!: string;
  @Input() artist!: string;
  @Input() cover!: string;
  @Input() routerLink!: any[] | string;
  @Input() artistRouterLink!: any[] | string;
  icons = Icons;
  menuItems = [
    {
      icon: Icons.shuffle,
      text: 'Shuffle play',
      click: () => alert('clicked'),
    },
    {
      icon: Icons.radio,
      text: 'Start radio',
    },
    {
      icon: Icons.playlistPlay,
      text: 'Play next',
      // click: () => (menuItems[0].icon = Icons.heartOutline),
    },
    {
      icon: Icons.playlistMusic,
      text: 'Add to queue',
    },
    {
      icon: Icons.heartOutline,
      text: 'Add to favorites',
    },
    {
      icon: Icons.accountMusic,
      text: 'Go to artist',
    },
  ];
  state: 'playing' | 'loading' | 'stopped' = 'stopped';

  constructor(@Optional() private cdr: ChangeDetectorRef) {}

  play() {
    this.state = 'loading';
    setTimeout(() => {
      this.state = 'playing';
      this.cdr.markForCheck();
    }, 1000);
  }

  pause() {
    this.state = 'stopped';
  }
}
