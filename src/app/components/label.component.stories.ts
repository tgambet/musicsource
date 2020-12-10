import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { LabelComponent } from './label.component';

export default {
  title: 'Components/Label',
  component: LabelComponent,
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

const Template: Story<LabelComponent> = (args: LabelComponent) => ({
  component: LabelComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  topLabel: 'My Supermix',
  bottomLabel: 'Formerly Your Mix',
};

export const TopLink = Template.bind({});
TopLink.args = {
  topLabel: {
    text: 'Muse',
    routerLink: '/',
  },
  bottomLabel: '130 songs',
  align: 'center',
};

export const Complex = Template.bind({});
Complex.args = {
  topLabel: {
    text: 'Matrix',
    routerLink: '/',
  },
  bottomLabel: [
    'Album',
    {
      text: 'Josman',
      routerLink: '/',
    },
  ],
};
