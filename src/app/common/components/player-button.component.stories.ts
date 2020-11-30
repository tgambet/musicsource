import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { IconComponent } from './icon.component';
import { PlayerButtonComponent } from './player-button.component';
import { MatRippleModule } from '@angular/material/core';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: '',
  template: `
    <app-player-button
      [playing]="playing"
      (playClicked)="playClicked()"
      (pauseClicked)="playClicked()"
    >
    </app-player-button>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 226px;
        height: 226px;
        padding: 16px;
        background-color: #333333;
      }
    `,
  ],
})
class TestComponent {
  @Input() playing!: boolean;
  playClicked() {
    this.playing = !this.playing;
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
    playClicked: { action: 'playClicked' },
    pauseClicked: { action: 'pauseClicked' },
  },
  decorators: [
    moduleMetadata({
      declarations: [IconComponent],
      imports: [MatRippleModule, MatButtonModule, MatProgressSpinnerModule],
      providers: [],
    }),
  ],
} as Meta;

const Template: Story<PlayerButtonComponent> = (
  args: PlayerButtonComponent
) => ({
  component: PlayerButtonComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  size: 'large',
  state: 'stopped',
};
