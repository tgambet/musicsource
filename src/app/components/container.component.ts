import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-container',
  template: ` <ng-content></ng-content> `,
  styleUrls: ['../styles/container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerComponent {}
