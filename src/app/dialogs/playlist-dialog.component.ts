import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  Injectable,
} from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import {
  AbstractControl,
  AsyncValidator,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RoutedDialogDirective } from '@app/directives/routed-dialog.directive';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UniquePlaylistTitleValidator implements AsyncValidator {
  constructor() {}

  validate(ctrl: AbstractControl): Observable<ValidationErrors | null> {
    console.log(ctrl.value);
    return ctrl.value.length < 10 ? of({ taken: 'title' }) : of(null);
  }
}

@Component({
  selector: 'app-playlist-dialog',
  template: `
    <ng-template
      appRoutedDialog
      outlet="dialog"
      [config]="config"
      #dialog="appRoutedDialog"
    >
      <div class="container">
        <app-title title="New playlist" size="small"></app-title>
        <form
          class="example-form"
          [formGroup]="form"
          (submit)="createPlaylist()"
        >
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
            <mat-error *ngIf="form.get('title').hasError('required')">
              Required
            </mat-error>
            <mat-error *ngIf="form.get('title').hasError('taken')">
              A playlist with that name already exists
            </mat-error>
          </mat-form-field>
          <mat-form-field class="example-full-width" color="accent">
            <mat-label>Description</mat-label>
            <input matInput placeholder="" formControlName="description" />
          </mat-form-field>
          <div class="actions">
            <button mat-button color="accent" matDialogClose type="reset">
              Cancel
            </button>
            <button mat-raised-button color="accent">
              Save
            </button>
          </div>
        </form>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .container {
        padding: 24px;
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
export class PlaylistDialogComponent implements OnInit {
  @ViewChild('dialog', { static: true })
  dialog!: RoutedDialogDirective;

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
      asyncValidators: this.uniqueTitleValidator.validate,
      updateOn: 'change',
    }),
    description: new FormControl(''),
  });

  constructor(private uniqueTitleValidator: UniquePlaylistTitleValidator) {}

  ngOnInit(): void {}

  async createPlaylist() {
    if (this.form.valid) {
      console.log(this.form.getRawValue());
      await this.dialog.close();
      // window.document.location.reload();
    }
  }
}
