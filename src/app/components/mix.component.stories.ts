import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { RouterModule } from '@angular/router';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { A11yModule } from '@angular/cdk/a11y';
import { LabelComponent } from './label.component';
import { IconComponent } from './icon.component';
import { MenuComponent } from './menu.component';
import { PlayerButtonComponent } from './player-button.component';
import { CoverComponent } from './cover.component';
import { APP_BASE_HREF } from '@angular/common';
import { MixComponent } from './mix.component';

export default {
  title: 'Home/Mix',
  component: MixComponent,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        RouterModule.forRoot([], { useHash: true }),
        MatRippleModule,
        MatButtonModule,
        MatMenuModule,
        BrowserAnimationsModule,
        MatProgressSpinnerModule,
        A11yModule,
      ],
      declarations: [
        LabelComponent,
        IconComponent,
        MenuComponent,
        PlayerButtonComponent,
        CoverComponent,
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

const Template: Story<MixComponent> = (args: MixComponent) => ({
  component: MixComponent,
  props: args,
});

export const Simple = Template.bind({});
Simple.args = {
  name: 'My Mix 2',
  label: 'Megadeth, Black Sabbath, Metallica, Sepultura',
};
