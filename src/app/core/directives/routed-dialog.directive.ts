import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { fromEvent, Subscription, throwError } from 'rxjs';
import { concatMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Directive({
  selector: '[appRoutedDialog]',
  exportAs: 'appRoutedDialog',
})
export class RoutedDialogDirective implements OnInit, OnDestroy {
  @Input() outlet!: string;
  @Input() config: MatDialogConfig = {};

  private dialogRef!: MatDialogRef<any>;
  private subscription: Subscription = new Subscription();

  constructor(
    private template: TemplateRef<any>,
    private elementRef: ElementRef,
    private dialog: MatDialog,
    private router: Router
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  @Input() afterClose: (_?: any) => void = () => {};

  ngOnInit(): void {
    this.open();
  }

  open(): void {
    this.dialogRef = this.dialog.open(this.template, this.config);

    this.subscription.add(
      this.dialogRef
        .afterClosed()
        .pipe(
          tap(() =>
            this.router.navigate([{ outlets: { [this.outlet]: null } }], {
              preserveFragment: true,
              queryParamsHandling: 'preserve',
            })
          ),
          tap((result) => this.afterClose(result))
        )
        .subscribe()
    );

    this.subscription.add(
      this.dialogRef
        .afterOpened()
        .pipe(
          concatMap(() => {
            const elem = document.getElementById(this.dialogRef.id);
            return elem
              ? fromEvent(elem, 'click')
              : throwError(
                  () => 'cannot find element with id: ' + this.dialogRef.id
                );
          }),
          tap(() => this.focus())
        )
        .subscribe()
    );
  }

  close(result?: unknown): void {
    this.dialogRef.close(result);
    // return this.router
    //   .navigate([{ outlets: { [this.outlet]: null } }], {
    //     preserveFragment: true,
    //   })
    //   .then(() => this.dialogRef.close(result));
  }

  focus(): void {
    this.dialog.openDialogs.forEach(({ id }) => {
      const dialog = document.getElementById(id);
      if (!dialog) {
        return;
      }
      const wrapper = dialog.closest(
        '.cdk-global-overlay-wrapper'
      ) as HTMLElement;
      wrapper.style.zIndex = this.dialogRef.id === id ? '1000' : '999';
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.dialogRef.close();
  }
}
