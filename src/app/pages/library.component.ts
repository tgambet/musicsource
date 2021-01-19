import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ScrollerService } from '@app/services/scroller.service';
import { tap, throttleTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-library',
  template: `
    <app-container class="recent">
      <app-recent-activity></app-recent-activity>
    </app-container>
    <div class="container" #navContainer [class.scrolled-top]="scrolledTop">
      <app-container>
        <nav mat-tab-nav-bar #nav color="accent">
          <a
            mat-tab-link
            disableRipple
            fragment="top"
            routerLink="playlists"
            routerLinkActive="active"
            queryParamsHandling="merge"
            [queryParams]="{
              sort: null,
              dir: null,
              likes: null
            }"
            #rla1="routerLinkActive"
            [active]="rla1.isActive"
          >
            Playlists
          </a>
          <a
            mat-tab-link
            disableRipple
            fragment="top"
            routerLink="albums"
            routerLinkActive="active"
            queryParamsHandling="merge"
            [queryParams]="{
              sort: null,
              dir: null,
              likes: null
            }"
            #rla2="routerLinkActive"
            [active]="rla2.isActive"
          >
            Albums
          </a>
          <a
            mat-tab-link
            disableRipple
            routerLink="songs"
            fragment="top"
            routerLinkActive="active"
            queryParamsHandling="merge"
            [queryParams]="{
              sort: null,
              dir: null,
              likes: null
            }"
            #rla3="routerLinkActive"
            [active]="rla3.isActive"
          >
            Songs
          </a>
          <a
            mat-tab-link
            disableRipple
            routerLink="artists"
            fragment="top"
            routerLinkActive="active"
            queryParamsHandling="merge"
            [queryParams]="{
              sort: null,
              dir: null,
              likes: null
            }"
            #rla4="routerLinkActive"
            [active]="rla4.isActive"
          >
            Artists
          </a>
        </nav>
      </app-container>
    </div>
    <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      app-title {
        margin-top: 32px;
      }
      .recent {
        margin-top: 32px;
        margin-bottom: 80px;
        min-height: 274px;
      }
      .container {
        position: sticky;
        top: 63px;
        z-index: 101;
        background: black;
      }
      .container.scrolled-top {
        background-color: #212121;
      }
      a {
        padding: 0;
        margin: 0 16px;
        font-weight: 500;
        font-size: 14px;
        text-transform: uppercase;
        min-width: initial;
      }
      a:hover {
        text-decoration: none;
      }
      a:first-of-type {
        margin-left: 0;
      }
      a:last-of-type {
        margin-right: 0;
      }
      a.active {
        opacity: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LibraryComponent implements OnInit, OnDestroy {
  @ViewChild('navContainer', { static: true })
  navContainer!: ElementRef;

  scrolledTop = false;

  subscription = new Subscription();

  constructor(
    private scroller: ScrollerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const scrollSub = this.scroller.scroll$
      .pipe(
        throttleTime(100, undefined, { leading: true, trailing: true }),
        tap(
          () =>
            (this.scrolledTop =
              this.navContainer.nativeElement.getBoundingClientRect().y <= 63)
        ),
        tap(() => this.cdr.markForCheck())
      )
      .subscribe();

    this.subscription.add(scrollSub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
