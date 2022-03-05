import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { PlaylistFacade } from '@app/database/playlists/playlist.facade';
import {
  getPlaylistId,
  Playlist,
} from '@app/database/playlists/playlist.model';

// @Directive({
//   selector: '[appUniquePlaylistTitleValidator]',
//   providers: [
//     {
//       provide: NG_ASYNC_VALIDATORS,
//       useExisting: UniquePlaylistTitleValidator,
//       multi: true,
//     },
//   ],
// })
// export class UniquePlaylistTitleValidator implements AsyncValidator {
//   constructor(private library: LibraryFacade) {}
//
//   validate(ctrl: AbstractControl): Observable<ValidationErrors | null> {
//     return this.library
//       .getPlaylist(ctrl.value)
//       .pipe(map((p) => (p ? { taken: 'title' } : null)));
//   }
// }

@Component({
  selector: 'app-playlist-dialog',
  template: `
    <app-title size="small">New playlist</app-title>
    <form class="example-form" [formGroup]="form" (submit)="createPlaylist()">
      <mat-form-field
        class="example-full-width"
        color="accent"
        hideRequiredMarker="true"
      >
        <mat-label>Title</mat-label>
        <input
          matInput
          placeholder=""
          type="text"
          required
          formControlName="title"
        />
        <mat-error *ngIf="form.get('title')?.hasError('required')">
          Required
        </mat-error>
        <mat-error *ngIf="form.get('title')?.hasError('taken')">
          A playlist with that name already exists
        </mat-error>
      </mat-form-field>
      <mat-form-field class="example-full-width" color="accent">
        <mat-label>Description</mat-label>
        <input matInput placeholder="" formControlName="description" />
      </mat-form-field>
      <div class="actions">
        <button mat-button color="accent" [matDialogClose]="false" type="reset">
          Cancel
        </button>
        <button mat-raised-button color="accent">Save</button>
      </div>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      app-title {
        margin-bottom: 48px;
      }
      mat-form-field {
        margin-bottom: 32px;
      }
      mat-form-field {
        width: 100%;
      }
      .actions {
        text-align: right;
      }
      button {
        text-transform: uppercase;
        margin-left: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistNewComponent {
  config: MatDialogConfig = {
    width: '90%',
    maxWidth: '500px',
    hasBackdrop: true,
    disableClose: true,
    scrollStrategy: new NoopScrollStrategy(),
    closeOnNavigation: false,
  };

  form = new FormGroup({
    title: new FormControl('', {
      validators: [Validators.required],
      asyncValidators: (
        control: AbstractControl
      ): Observable<ValidationErrors | null> =>
        this.playlists.getByIndexKey(control.value, 'title').pipe(
          first(),
          map((p) => (p.length > 0 ? { taken: 'title' } : null))
        ),
      updateOn: 'change',
    }),
    description: new FormControl(''),
  });

  constructor(
    private playlists: PlaylistFacade,
    private dialog: MatDialogRef<PlaylistNewComponent>
  ) {}

  createPlaylist(): void {
    if (this.form.valid) {
      const f = this.form.getRawValue();
      const playlist: Playlist = {
        songs: [],
        createdOn: new Date().getTime(),
        id: getPlaylistId(f.title),
        ...f,
      };
      this.playlists.create(playlist);
      this.dialog.close(playlist);
    }
  }
}
