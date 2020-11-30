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
    <div class="image">
      <app-menu [triggerIcon]="icons.dotsVertical" [menuItems]="menuItems">
      </app-menu>
      <app-player-button
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
      app-menu {
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      .image:hover app-menu {
        opacity: 1;
      }
      app-player-button {
        position: absolute;
        right: 16px;
        bottom: 16px;
        z-index: 1;
        transform: scale(0.8);
        transition: transform 0.2s ease;
      }
      app-player-button:hover {
        transform: scale(1);
      }
      app-menu {
        position: absolute;
        right: 8px;
        top: 8px;
        z-index: 1;
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
          black,
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
