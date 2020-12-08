import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { SongComponent } from './song.component';

export default {
  title: 'Home/Song',
  component: SongComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [],
      providers: [],
    }),
  ],
} as Meta;

const Template: Story<SongComponent> = (args: SongComponent) => ({
  component: SongComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {};
