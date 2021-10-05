import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Icons } from '@app/core/utils/icons.util';
import { Artist } from '@app/database/artists/artist.model';
import { Observable } from 'rxjs';
import { LibraryFacade } from '@app/library/store/library.facade';

@Component({
  selector: 'app-artist',
  template: `
    <div class="image">
      <a
        [routerLink]="['/', 'artist', artist.hash]"
        matRipple
        [title]="artist.name"
        style="--aspect-ratio:1"
      >
        <img
          *ngIf="cover$ | async as cover; else icon"
          [src]="cover"
          [alt]="artist.name"
        />
        <ng-template #icon>
          <app-icon [path]="icons.account" [size]="200"></app-icon
        ></ng-template>
      </a>
    </div>
    <app-label
      align="center"
      [topLabel]="{
        text: artist.name,
        routerLink: ['/', 'artist', artist.hash]
      }"
      [bottomLabel]=""
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
  @Input() artist!: Artist;

  cover$!: Observable<string | undefined>;

  icons = Icons;

  constructor(private library: LibraryFacade) {
    this.cover$ = this.library.getCover(this.artist.pictureKey);
  }
}
