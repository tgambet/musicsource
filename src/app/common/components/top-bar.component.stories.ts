import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { TopBarComponent } from './top-bar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from './icon.component';
import { MenuComponent } from './menu.component';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export default {
  title: 'Home/Top Bar',
  component: TopBarComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      declarations: [IconComponent, MenuComponent],
      imports: [
        RouterTestingModule,
        MatButtonModule,
        MatMenuModule,
        BrowserAnimationsModule,
      ],
      providers: [],
    }),
  ],
} as Meta;

const Template: Story<TopBarComponent> = (args: TopBarComponent) => ({
  component: TopBarComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {};
