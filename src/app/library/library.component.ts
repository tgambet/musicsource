import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-library',
  template: `
    <app-container class="recent">
      <!-- <app-recent-activity></app-recent-activity>-->
    </app-container>
    <div class="container">
      <app-container>
        <nav mat-tab-nav-bar color="accent">
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
      .recent {
        height: 291px;
      }
      .container {
        margin-top: 32px;
        position: sticky;
        top: 63px;
        z-index: 101;
        background: black;
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
export class LibraryComponent {}
