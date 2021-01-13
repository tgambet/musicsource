import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Optional,
  ChangeDetectorRef,
} from '@angular/core';
import { Icons } from '../utils/icons.util';
import { PlayerState } from './player-button.component';
import { AlbumWithCover$ } from '@app/models/album.model';
import { hash } from '@app/utils/hash.util';

@Component({
  selector: 'app-album',
  template: `
    <app-cover
      [title]="album.name"
      [menuItems]="menuItems"
      [coverRouterLink]="['/', 'album', album.hash]"
      [playerState]="state"
      (playClicked)="play()"
      (pauseClicked)="pause()"
      tabindex="-1"
    >
      <img
        *ngIf="album.cover$ | async as cover; else icon"
        [src]="cover"
        [alt]="album.name"
      />
      <ng-template #icon>
        <app-icon [path]="icons.album" [fullWidth]="true"></app-icon>
      </ng-template>
    </app-cover>
    <app-label
      [topLabel]="{ text: album.name, routerLink: ['/', 'album', album.hash] }"
      [bottomLabel]="[
        'Album',
        album.albumArtist
          ? {
              text: album.albumArtist,
              routerLink: ['/', 'artist', getHash(album.albumArtist)]
            }
          : album.artists.length > 1
          ? 'Various artists'
          : undefined,
        album.year ? album.year.toString(10) : ''
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
  @Input() album!: AlbumWithCover$;
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
      text: 'Add to your likes',
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

  getHash(s: string): string {
    return hash(s);
  }
}
