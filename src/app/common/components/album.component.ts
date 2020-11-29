import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-album',
  template: `
    <div class="image">
      <!-- TODO mini player -->
      <button mat-icon-button>
        <mat-icon>play_arrow</mat-icon>
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
}
