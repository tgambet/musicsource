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
      [coverRouterLink]="albumRouterLink"
      [playerState]="state"
      (playClicked)="play()"
      (pauseClicked)="pause()"
      tabindex="-1"
    >
      <img *ngIf="cover" [src]="cover" [alt]="name" />
      <app-icon
        *ngIf="!cover"
        [path]="icons.album"
        [fullWidth]="true"
      ></app-icon>
    </app-cover>
    <app-label
      [topLabel]="{ text: name, routerLink: albumRouterLink }"
      [bottomLabel]="[
        'Album',
        artist && artistRouterLink
          ? { text: artist, routerLink: artistRouterLink }
          : artist || '',
        year ? year.toString(10) : ''
      ]"
      [size]="size"
    ></app-label>
  `,
  styles: [
    `
      :host,
      img {
        display: block;
        width: 100%;
      }
      app-cover {
        margin-bottom: 16px;
        background-color: rgba(255, 255, 255, 0.1);
      }
      app-icon {
        color: rgba(255, 255, 255, 0.5);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumComponent {
  @Input() name!: string;
  @Input() artist?: string;
  @Input() year?: number;
  @Input() cover?: string;
  @Input() albumRouterLink!: any[] | string;
  @Input() artistRouterLink!: any[] | string | undefined;
  @Input() size: 'small' | 'large' = 'large';
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
