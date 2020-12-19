import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  HostListener,
  OnInit,
} from '@angular/core';
import { ExtractorService } from '@app/services/extractor.service';
import { FileService } from '@app/services/file.service';
import { AudioService } from '@app/services/audio.service';

@Component({
  selector: 'app-root',
  template: `
    <app-top-bar></app-top-bar>
    <router-outlet></router-outlet>
    <router-outlet name="dialog"></router-outlet>
    <router-outlet name="help"></router-outlet>
    <router-outlet name="feedback"></router-outlet>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }
      app-top-bar {
        flex: 0 0 64px;
      }
    `,
  ],
  providers: [FileService, ExtractorService, AudioService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  @HostBinding('class.scrolled-top')
  scrolledTop = true;

  constructor() {}

  @HostListener('window:scroll', ['$event'])
  setScrolledTop(event: any) {
    this.scrolledTop = event.target.scrollingElement.scrollTop === 0;
  }

  ngOnInit(): void {
    // this.library.load();
  }
}
