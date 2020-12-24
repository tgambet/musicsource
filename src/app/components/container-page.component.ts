import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-container-page',
  template: ` <ng-content></ng-content> `,
  styleUrls: ['../styles/container-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerPageComponent {}
