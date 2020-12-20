import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LibraryFacade } from '@app/store/library/library.facade';
import { Picture } from '@app/services/extractor.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  template: `
    <app-title title="Your favorites"></app-title>
    <app-h-list buttonsTopPosition="113px">
      <div class="album" appHListItem *ngFor="let album of albums$ | async">
        <app-album
          [name]="album.name"
          [artist]="album.artist"
          [cover]="getCover(album.cover)"
        ></app-album>
      </div>
    </app-h-list>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 32px;
      }
      .album {
        margin: 0 24px 0 0;
      }
      .album:last-child {
        margin-right: 0;
      }
      app-title {
        margin-bottom: 40px;
      }
      app-h-list {
        margin: 0 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  albums$ = this.library.albums$.pipe(
    map((albums) => albums.filter((a) => !!a.cover).slice(0, 10))
  );

  constructor(private library: LibraryFacade) {}

  ngOnInit(): void {}

  getCover(picture: Picture | undefined): string {
    return picture ? `data:${picture.format};base64,${picture.data}` : '';
  }
}
