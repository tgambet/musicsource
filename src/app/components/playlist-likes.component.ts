import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Icons } from '@app/utils/icons.util';
import { MenuItem } from '@app/components/menu.component';
import { PlayerState } from '@app/components/player-button.component';

@Component({
  selector: 'app-playlist-likes',
  template: `
    <app-cover
      title="Your likes"
      [menuItems]="menuItems"
      [coverRouterLink]="['/', 'likes']"
      [playerState]="state"
      (playClicked)="play()"
      (pauseClicked)="pause()"
    >
      <app-icon-likes></app-icon-likes>
    </app-cover>
    <app-label
      [topLabel]="{
        text: 'Your Likes',
        routerLink: ['/', 'likes']
      }"
      [bottomLabel]="'Auto playlist'"
      size="small"
    ></app-label>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      app-cover {
        margin-bottom: 16px;
        background-color: #f88dae;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistLikesComponent implements OnInit {
  icons = Icons;

  menuItems!: MenuItem[];

  state: PlayerState = 'stopped';

  constructor() {}

  ngOnInit(): void {}

  play() {
    this.state = 'loading';
    setTimeout(() => {
      this.state = 'playing';
    }, 1000);
  }

  pause() {
    this.state = 'stopped';
  }
}
