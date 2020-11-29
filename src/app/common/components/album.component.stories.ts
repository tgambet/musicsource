import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { AlbumComponent } from './album.component';
import { LabelComponent } from './label.component';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from './icon.component';
import { MenuComponent } from './menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export default {
  title: 'Components/Album',
  component: AlbumComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        RouterModule.forRoot([], { useHash: true }),
        MatRippleModule,
        MatButtonModule,
        MatMenuModule,
        BrowserAnimationsModule,
      ],
      declarations: [LabelComponent, IconComponent, MenuComponent],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },
      ],
    }),
  ],
} as Meta;

const Template: Story<AlbumComponent> = (args: AlbumComponent) => ({
  component: AlbumComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  name: 'Outrun',
  artist: 'Kavinsky',
  routerLink: './',
  artistRouterLink: './',
  cover: '/assets/tests/kavinsky_outrun.jpg',
};
