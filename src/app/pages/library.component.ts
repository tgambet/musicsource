import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-library',
  template: `
    <app-container class="recent">
      <app-title size="small" title="Recent activity"></app-title>
      <app-h-list buttonsTopPosition="80px">
        <div class="recent" appHListItem>
          <!--          <app-album
            *ngFor="let album of albums$ | async"
          >
          </app-album>-->
        </div>
      </app-h-list>
    </app-container>
    <div class="container" #navContainer [class.scrolled-top]="scrolledTop">
      <app-container>
        <nav mat-tab-nav-bar #nav color="accent">
          <a
            mat-tab-link
            disableRipple
            routerLink="playlists"
            fragment="top"
            routerLinkActive="active"
            queryParamsHandling="merge"
            [queryParams]="{
              sort: null,
              dir: null,
              favorites: null
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
              favorites: null
            }"
            #rla2="routerLinkActive"
            [active]="rla2.isActive"
          >
            Albums
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
              favorites: null
            }"
            #rla4="routerLinkActive"
            [active]="rla4.isActive"
          >
            Artists
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
              favorites: null
            }"
            #rla3="routerLinkActive"
            [active]="rla3.isActive"
          >
            Songs
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
        height: 200px;
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
      .container.scrolled-top nav {
        /*border-bottom: none;*/
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
export class LibraryComponent implements OnInit {
  @ViewChild('navContainer', { static: true })
  navContainer!: ElementRef;

  scrolledTop = false;

  @HostListener('window:scroll')
  update() {
    this.scrolledTop =
      this.navContainer.nativeElement.getBoundingClientRect().y <= 63;
  }

  ngOnInit(): void {
    setTimeout(() => this.update());
  }
}
