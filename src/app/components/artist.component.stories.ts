import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { ArtistComponent } from './artist.component';
import { LabelComponent } from './label.component';
import { MatRippleModule } from '@angular/material/core';

export default {
  title: 'Home/Artist',
  component: ArtistComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [RouterModule.forRoot([], { useHash: true }), MatRippleModule],
      declarations: [LabelComponent],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },
      ],
    }),
  ],
} as Meta;

const Template: Story<ArtistComponent> = (args: ArtistComponent) => ({
  component: ArtistComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  name: 'Muse',
  legend: '130 songs',
  artistRouterLink: './',
  cover: '/muse.jpg',
};
