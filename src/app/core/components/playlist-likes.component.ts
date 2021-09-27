import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Icons } from '@app/core/utils/icons.util';
import { MenuItem } from '@app/core/components/menu.component';

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
export class PlaylistLikesComponent {
  icons = Icons;

  menuItems!: MenuItem[];
}
