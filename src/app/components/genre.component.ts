import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-genre',
  template: `
    <button
      mat-button
      [ngStyle]="{ borderColor: color }"
      [routerLink]="genreRouterLink"
    >
      {{ name }}
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      button {
        height: 48px;
        width: 226px;
        text-align: left;
        padding: 0 12px;
        background-color: rgba(255, 255, 255, 0.15);
        border-left-width: 6px;
        border-left-style: solid;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenreComponent {
  @Input() name!: string;
  @Input() color!: string;
  @Input() genreRouterLink!: any[] | string;
}
