import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
import { PlaylistId } from '@app/database/playlists/playlist.model';

export interface PlaylistData {
  id?: PlaylistId;
  title: string;
  description?: string;
}

@Component({
  selector: 'app-playlist-dialog',
  template: `
    <app-title size="small" *ngIf="!data?.id">New playlist</app-title>
    <app-title size="small" *ngIf="!!data?.id">Edit playlist</app-title>
    <form class="example-form" [formGroup]="form" (submit)="close()">
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
          autocomplete="false"
          spellcheck="false"
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
        <input
          matInput
          placeholder=""
          type="text"
          formControlName="description"
          autocomplete="false"
          spellcheck="false"
        />
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
  form: FormGroup;

  constructor(
    private playlists: PlaylistFacade,
    private dialog: MatDialogRef<PlaylistNewComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: PlaylistData
  ) {
    this.form = new FormGroup({
      title: new FormControl(data?.title, {
        validators: [Validators.required],
        asyncValidators: (
          control: AbstractControl
        ): Observable<ValidationErrors | null> =>
          this.playlists.getByIndexKey(control.value, 'title').pipe(
            first(),
            map((p) =>
              p.length > 0 && p[0].id !== data?.id ? { taken: 'title' } : null
            )
          ),
        updateOn: 'change',
      }),
      description: new FormControl(data?.description),
    });
  }

  close(): void {
    if (this.form.valid) {
      const data = this.form.getRawValue() as PlaylistData;
      this.dialog.close(data);
    }
  }
}
