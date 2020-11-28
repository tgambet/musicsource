import { Meta, Story } from '@storybook/angular';
import { TitleComponent } from './title.component';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

export default {
  title: 'Components/Title',
  component: TitleComponent,
  argTypes: {},
} as Meta;

const Template: Story<TitleComponent> = (args: TitleComponent) => ({
  component: TitleComponent,
  props: args,
  moduleMetadata: {
    imports: [RouterModule.forRoot([], { useHash: true })],
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
  title: 'Your favorites',
};

export const WithLink = Template.bind({});
WithLink.args = {
  title: 'New releases',
  link: '/',
  moreLink: 'See all',
};

export const WithHead = Template.bind({});
WithHead.args = {
  title: 'Your afternoon music',
  head: 'Listen again',
};

export const WithAvatar = Template.bind({});
WithAvatar.args = {
  head: 'Similar to',
  title: 'Keny Arkana',
  avatar: '/assets/tests/keny_arkana_small.jpg',
  avatarStyle: 'round',
  link: '/',
};
