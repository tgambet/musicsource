import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { GenreComponent } from './genre.component';

export default {
  title: 'Home/Genre',
  component: GenreComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        RouterModule.forRoot([], { useHash: true }),
        MatRippleModule,
        MatButtonModule,
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

const Template: Story<GenreComponent> = (args: GenreComponent) => ({
  component: GenreComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  name: 'Rock & Metal',
  color: 'green',
  routerLink: '/',
};
