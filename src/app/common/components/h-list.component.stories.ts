import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { Component } from '@angular/core';
import { IconComponent } from './icon.component';
import { HListComponent, HListItemDirective } from './h-list.component';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'test',
  template: `
    <app-h-list>
      <div appHListItem>1</div>
      <div appHListItem>2</div>
      <div appHListItem>3</div>
      <div appHListItem>4</div>
      <div appHListItem>5</div>
      <div appHListItem>6</div>
      <div appHListItem>7</div>
    </app-h-list>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      app-h-list {
        width: 300px;
        height: 150px;
      }
      div {
        width: 150px;
        height: 100%;
        outline: 1px solid brown;
        background-color: bisque;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
      }
    `,
  ],
})
class HListTestComponent {}

export default {
  title: 'Components/Horizontal List',
  component: HListTestComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      declarations: [IconComponent, HListItemDirective, HListComponent],
      imports: [MatButtonModule, A11yModule],
      providers: [],
    }),
  ],
} as Meta;

const Template: Story<HListTestComponent> = (args: HListTestComponent) => ({
  component: HListTestComponent,
  props: args,
});

export const Example = Template.bind({});
Example.args = {};
