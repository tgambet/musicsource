import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-song',
  template: `
    <p>
      song works!
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SongComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
