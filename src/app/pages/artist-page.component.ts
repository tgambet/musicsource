import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-artist-page',
  template: `
    <p>
      artist-page works!
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
