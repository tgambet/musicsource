import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { CoverComponent } from './cover.component';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { A11yModule } from '@angular/cdk/a11y';
import { MenuComponent, MenuItem } from './menu.component';
import { IconComponent } from './icon.component';
import { PlayerButtonComponent, PlayerState } from './player-button.component';
import { Component, Input } from '@angular/core';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'test',
  template: `
    <app-cover
      [title]="title"
      [menuItems]="menuItems"
      [routerLink]="routerLink"
      [playerState]="playerState"
      (playClicked)="noOp()"
      (pauseClicked)="noOp()"
    >
      <div class="image">
        cover
      </div>
    </app-cover>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .image {
        width: 226px;
        height: 226px;
        background-color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
class TestComponent {
  @Input() title!: string;
  @Input() playerState!: PlayerState;
  @Input() routerLink!: any[] | string;
  @Input() menuItems!: MenuItem[];
  noOp(): void {}
}

export default {
  title: 'Components/Cover',
  component: TestComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      declarations: [
        IconComponent,
        MenuComponent,
        PlayerButtonComponent,
        CoverComponent,
      ],
      imports: [
        RouterModule.forRoot([], { useHash: true }),
        MatRippleModule,
        MatButtonModule,
        MatMenuModule,
        BrowserAnimationsModule,
        MatProgressSpinnerModule,
        A11yModule,
      ],
      providers: [],
    }),
  ],
} as Meta;

const Template: Story<TestComponent> = (args: TestComponent) => ({
  component: TestComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  title: 'Title',
  routerLink: './',
  menuItems: [
    { text: 'Menu Item 1' },
    { text: 'Menu Item 2' },
    { text: 'Menu Item 3' },
  ],
  playerState: 'stopped',
};
