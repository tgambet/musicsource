import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Icons } from '../icons';

@Component({
  selector: 'app-album',
  template: `
    <div class="image">
      <!-- TODO mini player -->
      <app-menu [triggerIcon]="icons.dotsVertical" [menuItems]="menuItems">
      </app-menu>
      <button mat-icon-button>
        <app-icon [path]="icons.play"></app-icon>
      </button>
      <a [routerLink]="routerLink" matRipple>
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
      button {
        position: absolute;
        right: 16px;
        bottom: 16px;
        z-index: 1;
        background-color: black;
        border: 4px solid black;
        box-sizing: content-box;
      }
      app-menu {
        position: absolute;
        right: 8px;
        top: 8px;
        z-index: 1;
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
}
