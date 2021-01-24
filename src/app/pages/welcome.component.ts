import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ScannerFacade } from '@app/store/scanner/scanner.facade';

@Component({
  selector: 'app-welcome',
  template: ` <button (click)="scan()">SCAN</button> `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent implements OnInit {
  constructor(private scanner: ScannerFacade) {}

  ngOnInit(): void {}

  scan() {
    this.scanner.openDirectory();
  }
}
