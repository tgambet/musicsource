import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-container-home',
  template: ` <ng-content></ng-content> `,
  styleUrls: ['../styles/container-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerHomeComponent {}
