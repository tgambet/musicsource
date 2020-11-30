import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { PlaylistComponent } from './playlist.component';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { A11yModule } from '@angular/cdk/a11y';
import { LabelComponent } from './label.component';
import { IconComponent } from './icon.component';
import { MenuComponent } from './menu.component';
import { PlayerButtonComponent } from './player-button.component';
import { CoverComponent } from './cover.component';
import { APP_BASE_HREF } from '@angular/common';

export default {
  title: 'Home/Playlist',
  component: PlaylistComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        RouterModule.forRoot([], { useHash: true }),
        MatRippleModule,
        MatButtonModule,
        MatMenuModule,
        BrowserAnimationsModule,
        MatProgressSpinnerModule,
        A11yModule,
      ],
      declarations: [
        LabelComponent,
        IconComponent,
        MenuComponent,
        PlayerButtonComponent,
        CoverComponent,
      ],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },
      ],
    }),
  ],
} as Meta;

const Template: Story<PlaylistComponent> = (args: PlaylistComponent) => ({
  component: PlaylistComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  name: 'Nu-Metal Rage',
  label: 'Korn, Linkin Park, Limp Bizkit, Rage Against the Machine',
  cover: '/assets/tests/playlist_nu_metal.jpg',
};
