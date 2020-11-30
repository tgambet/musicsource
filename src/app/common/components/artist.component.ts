import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-artist',
  template: `
    <div class="image">
      <a [routerLink]="routerLink" matRipple [title]="name">
        <img [src]="cover" [alt]="name" height="226" width="226" />
      </a>
    </div>
    <app-label
      align="center"
      [topLabel]="{ text: name, routerLink: routerLink }"
      [bottomLabel]="legend"
    ></app-label>
  `,
  styles: [
    `
      :host,
      a,
      img {
        display: block;
      }
      .image {
        margin-bottom: 16px;
        overflow: hidden;
        border-radius: 50%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistComponent {
  @Input() name!: string;
  @Input() legend!: string;
  @Input() cover!: string;
  @Input() routerLink!: any[] | string;
}
