import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Optional,
} from '@angular/core';
import { Icons } from '../utils/icons.util';
import { PlayerState } from './player-button.component';

@Component({
  selector: 'app-playlist',
  template: `
    <app-cover
      [title]="name"
      [menuItems]="menuItems"
      [coverRouterLink]="playlistRouterLink"
      [playerState]="state"
      (playClicked)="play()"
      (pauseClicked)="pause()"
      tabindex="-1"
    >
      <img [src]="cover" height="226" width="226" alt="cover" *ngIf="cover" />
      <app-icon
        [path]="icons.playlistPlay"
        [size]="72"
        *ngIf="!cover"
      ></app-icon>
    </app-cover>
    <app-label
      [topLabel]="{ text: name, routerLink: playlistRouterLink }"
      [bottomLabel]="label"
      size="small"
    ></app-label>
  `,
  styles: [
    `
      :host,
      img {
        display: block;
        max-width: 226px;
      }
      app-cover {
        margin-bottom: 16px;
        background-color: #4f4f4f;
      }
      app-icon {
        color: rgba(0, 0, 0, 0.2);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistComponent {
  @Input() cover!: string;
  @Input() name!: string;
  @Input() label!: string;
  @Input() playlistRouterLink!: any[] | string;
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
      icon: Icons.playlistPlus,
      text: 'Add to playlist',
    },
  ];
  state: PlayerState = 'stopped';

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
