import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Icons } from '@app/utils/icons.util';
import { MenuItem } from '@app/components/menu.component';

@Component({
  selector: 'app-playlist-likes',
  template: `
    <app-cover
      title="Your likes"
      [menuItems]="menuItems"
      [coverRouterLink]="['/', 'likes']"
    >
      <app-icon-likes2></app-icon-likes2>
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
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistLikesComponent implements OnInit {
  icons = Icons;

  menuItems!: MenuItem[];

  constructor() {}

  ngOnInit(): void {}
}
