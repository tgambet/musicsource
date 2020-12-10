import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { MenuComponent } from './menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from './icon.component';
import { Icons } from '../utils/icons.util';

export default {
  title: 'Components/Menu',
  component: MenuComponent,
  argTypes: {
    triggerIcon: {
      control: {
        type: 'select',
        options: [Icons.dotsVertical, Icons.accountMusic],
      },
    },
    menuItems: {
      control: { disable: true },
    },
  },
  decorators: [
    moduleMetadata({
      declarations: [IconComponent],
      imports: [BrowserAnimationsModule, MatButtonModule, MatMenuModule],
      providers: [],
    }),
  ],
} as Meta;

const Template: Story<MenuComponent> = (args: MenuComponent) => ({
  component: MenuComponent,
  props: args,
});

const menuItems = [
  {
    icon: Icons.shuffle,
    text: 'Shuffle play',
    click: () => alert('clicked'),
  },
  {
    icon: Icons.radio,
    text: 'Start radio',
  },
  {
    icon: Icons.playlistPlay,
    text: 'Play next',
    // click: () => (menuItems[0].icon = Icons.heartOutline),
  },
  {
    icon: Icons.playlistMusic,
    text: 'Add to queue',
  },
  {
    icon: Icons.heartOutline,
    text: 'Add to favorites',
  },
  {
    icon: Icons.accountMusic,
    text: 'Go to artist',
  },
];

export const Simple = Template.bind({});
Simple.args = {
  triggerIcon: Icons.dotsVertical,
  menuItems,
};
