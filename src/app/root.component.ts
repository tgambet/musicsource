import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <router-outlet name="dialog"></router-outlet>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent {}
