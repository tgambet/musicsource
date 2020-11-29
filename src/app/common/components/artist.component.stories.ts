import { Meta, Story } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { ArtistComponent } from './artist.component';
import { LabelComponent } from './label.component';
import { MatRippleModule } from '@angular/material/core';

export default {
  title: 'Components/Artist',
  component: ArtistComponent,
  argTypes: {},
} as Meta;

const Template: Story<ArtistComponent> = (args: ArtistComponent) => ({
  component: ArtistComponent,
  props: args,
  moduleMetadata: {
    imports: [RouterModule.forRoot([], { useHash: true }), MatRippleModule],
    declarations: [LabelComponent],
    providers: [
      {
        provide: APP_BASE_HREF,
        useValue: '/',
      },
    ],
  },
});

export const Simple = Template.bind({});
Simple.args = {
  name: 'Muse',
  legend: '130 songs',
  routerLink: './',
  cover: '/assets/tests/muse.jpg',
};
