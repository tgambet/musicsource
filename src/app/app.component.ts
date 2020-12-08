import { Component, HostBinding, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <router-outlet name="dialog"></router-outlet>
    <router-outlet name="help"></router-outlet>
    <router-outlet name="feedback"></router-outlet>
  `,
  styles: [],
})
export class AppComponent {
  @HostBinding('class.scrolled-top')
  scrolledTop = true;

  @HostListener('window:scroll', ['$event'])
  setScrolledTop(event: any) {
    this.scrolledTop = event.target.scrollingElement.scrollTop === 0;
  }
}
