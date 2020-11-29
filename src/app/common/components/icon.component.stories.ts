import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { IconComponent } from './icon.component';
import { Icons } from '../icons';

export default {
  title: 'Components/Icon',
  component: IconComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [],
      providers: [],
    }),
  ],
} as Meta;

const Template: Story<IconComponent> = (args: IconComponent) => ({
  component: IconComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  path: Icons.heartOutline,
};
