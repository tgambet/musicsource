import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { IconComponent } from './icon.component';
import { PlayerButtonComponent } from './player-button.component';
import { MatRippleModule } from '@angular/material/core';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'test',
  template: `
    <app-player-button
      [state]="state"
      (playClicked)="playClicked()"
      (pauseClicked)="pauseClicked()"
    >
    </app-player-button>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 126px;
        height: 126px;
        padding: 16px;
        background-color: cadetblue;
      }
    `,
  ],
})
class TestComponent {
  state: 'stopped' | 'playing' | 'loading' = 'stopped';
  playClicked() {
    this.state = 'loading';
    setTimeout(() => (this.state = 'playing'), 1000);
  }
  pauseClicked() {
    this.state = 'stopped';
  }
}

export default {
  title: 'Components/PlayerButton',
  component: PlayerButtonComponent,
  argTypes: {
    size: {
      control: {
        type: 'select',
        options: ['small', 'large'],
      },
    },
    state: {
      control: {
        type: 'select',
        options: ['playing', 'loading', 'stopped'],
      },
    },
    // playClicked: { action: 'playClicked' },
    // pauseClicked: { action: 'pauseClicked' },
  },
  decorators: [
    moduleMetadata({
      declarations: [PlayerButtonComponent, IconComponent],
      imports: [MatRippleModule, MatButtonModule, MatProgressSpinnerModule],
      providers: [],
    }),
  ],
} as Meta;

const Template1: Story<PlayerButtonComponent> = (
  args: PlayerButtonComponent
) => ({
  component: PlayerButtonComponent,
  props: args,
});

const Template2: Story<TestComponent> = (args: TestComponent) => ({
  component: TestComponent,
  props: args,
});

export const Simple = Template1.bind({});
Simple.args = {
  size: 'large',
  state: 'stopped',
};

export const Mocked = Template2.bind({});
Mocked.args = {};
