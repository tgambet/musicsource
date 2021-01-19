import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Icons } from '@app/utils/icons.util';

@Component({
  selector: 'app-artist',
  template: `
    <div class="image">
      <a
        [routerLink]="artistRouterLink"
        matRipple
        [title]="name"
        style="--aspect-ratio:1"
      >
        <img *ngIf="cover" [src]="cover" [alt]="name" />
        <app-icon *ngIf="!cover" [path]="icons.account" [size]="200"></app-icon>
      </a>
    </div>
    <app-label
      align="center"
      [topLabel]="{ text: name, routerLink: artistRouterLink }"
      [bottomLabel]="legend"
    ></app-label>
  `,
  styles: [
    `
      :host {
        display: block;
        max-width: 226px;
      }
      a,
      img {
        display: block;
      }
      .image {
        margin-bottom: 16px;
        overflow: hidden;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.1);
        width: 100%;
      }
      .image a {
        height: 100%;
        text-align: center;
      }
      app-icon {
        color: rgba(255, 255, 255, 0.33);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistComponent {
  @Input() name!: string;
  @Input() legend!: string;
  @Input() cover?: string | null;
  @Input() artistRouterLink!: any[] | string;

  icons = Icons;
}
