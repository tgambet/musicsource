import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icons } from '@app/utils/icons.util';
import { Observable, toArray } from 'rxjs';
import { Playlist } from '@app/models/playlist.model';
import { LibraryFacade } from '@app/store/library/library.facade';

@Component({
  selector: 'app-playlist-add',
  template: `
    <app-title mat-dialog-title size="small">My playlists</app-title>
    <mat-dialog-content>
      <ng-container *ngFor="let playlist of playlists$ | async">
        <button mat-menu-item [mat-dialog-close]="playlist.title">
          <app-icon [path]="icons.playlistEdit"></app-icon>
          {{ playlist.title }}
        </button>
      </ng-container>
    </mat-dialog-content>
    <div class="dialog-actions">
      <button mat-button [mat-dialog-close]="true" class="new-playlist">
        New playlist
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      app-icon {
        margin-right: 8px;
      }
      .mat-dialog-container {
        padding-bottom: 0 !important;
      }
      .dialog-actions {
        text-align: right;
        margin: 0 -24px 0;
      }
      .new-playlist {
        width: 100%;
        height: 52px;
        text-transform: uppercase;
      }
      .mat-dialog-content {
        padding: 0 !important;
        border: solid rgba(255, 255, 255, 0.1);
        border-width: 1px 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistAddComponent {
  icons = Icons;

  playlists$: Observable<Playlist[]> = this.library
    .getPlaylists('title')
    .pipe(toArray());

  constructor(private library: LibraryFacade) {}
}
