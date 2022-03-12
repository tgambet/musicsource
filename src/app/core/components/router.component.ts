import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  template: ` <router-outlet></router-outlet> `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouterComponent {}
