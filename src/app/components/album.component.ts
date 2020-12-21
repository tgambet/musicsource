import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Optional,
  ChangeDetectorRef,
} from '@angular/core';
import { Icons } from '../utils/icons.util';
import { PlayerState } from './player-button.component';

@Component({
  selector: 'app-album',
  template: `
    <app-cover
      [title]="name"
      [menuItems]="menuItems"
      [routerLink]="routerLink"
      [playerState]="state"
      (playClicked)="play()"
      (pauseClicked)="pause()"
      tabindex="-1"
    >
      <img *ngIf="cover" [src]="cover" [alt]="name" height="226" width="226" />
      <app-icon *ngIf="!cover" [path]="icons.album" [size]="226"></app-icon>
    </app-cover>
    <app-label
      [topLabel]="{ text: name, routerLink: routerLink }"
      [bottomLabel]="[
        'Album',
        { text: artist || '', routerLink: artistRouterLink }
      ]"
    ></app-label>
  `,
  styles: [
    `
      :host,
      img {
        display: block;
      }
      app-cover {
        margin-bottom: 16px;
        background-color: rgba(255, 255, 255, 0.1);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumComponent {
  @Input() name!: string;
  @Input() artist?: string;
  @Input() cover?: string;
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
  state: PlayerState = 'stopped';

  constructor(@Optional() private cdr?: ChangeDetectorRef) {}

  play() {
    this.state = 'loading';
    setTimeout(() => {
      this.state = 'playing';
      this.cdr?.markForCheck();
    }, 1000);
  }

  pause() {
    this.state = 'stopped';
  }
}
