import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { TitleComponent } from './title.component';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';

export default {
  title: 'Components/Title',
  component: TitleComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [RouterModule.forRoot([], { useHash: true })],
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: '/',
        },
      ],
    }),
  ],
} as Meta;

const Template: Story<TitleComponent> = (args: TitleComponent) => ({
  component: TitleComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  title: 'Your favorites',
};

export const WithLink = Template.bind({});
WithLink.args = {
  title: 'New releases',
  titleRouterLink: '/',
  extraLinkLabel: 'See all',
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
  avatarSrc: '/keny_arkana_small.jpg',
  avatarStyle: 'round',
  titleRouterLink: '/',
};
