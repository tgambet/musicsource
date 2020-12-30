import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Icons } from '@app/utils/icons.util';
import { RoutedDialogDirective } from '@app/directives/routed-dialog.directive';

@Component({
  selector: 'app-settings',
  template: `
    <ng-template appRoutedDialog outlet="dialog" [config]="config">
      <div class="container">
        <div class="title" cdkDrag cdkDragRootElement=".settings">
          <span class="handle" cdkDragHandle></span>
          <span>Settings</span>
          <button class="close" mat-icon-button mat-dialog-close>
            <app-icon [path]="icons.close"></app-icon>
          </button>
        </div>
        <div class="content">
          <nav>
            <a routerLink="library">Library</a>
            <a>Audio</a>
            <a>Services</a>
            <a>Data</a>
            <a>About</a>
          </nav>
          <router-outlet></router-outlet>
        </div>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .title {
        position: relative;
        padding: 0 12px 0 24px;
        flex: 0 0 64px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .close {
        margin-left: auto;
      }
      .handle {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 64px;
        cursor: move;
      }
      .content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: row;
        max-height: calc(100% - 65px);
      }
      nav {
        display: flex;
        flex-direction: column;
        padding: 16px 0;
        border-right: 1px solid rgba(255, 255, 255, 0.1);
        width: 150px;
      }
      nav a {
        padding: 12px 24px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  @ViewChild(RoutedDialogDirective)
  routed!: RoutedDialogDirective;

  icons = Icons;
  config: MatDialogConfig = {
    height: '700px',
    maxHeight: '100%',
    width: '90%',
    maxWidth: '800px',
    hasBackdrop: false,
    panelClass: 'settings',
    scrollStrategy: new NoopScrollStrategy(),
    closeOnNavigation: false,
  };

  close() {
    this.routed.close();
  }
}
