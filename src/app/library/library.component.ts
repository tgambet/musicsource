import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatLegacyTabNav as MatTabNav } from '@angular/material/legacy-tabs';

@Component({
  selector: 'app-library',
  template: `
    <!--    <app-container class="recent">-->
    <!--      &lt;!&ndash; <app-recent-activity></app-recent-activity>&ndash;&gt;-->
    <!--    </app-container>-->
    <div class="container">
      <app-container>
        <nav mat-tab-nav-bar #navBar="matTabNavBar" color="accent">
          <a
            mat-tab-link
            disableRipple
            fragment="top"
            routerLink="playlists"
            routerLinkActive="active"
            queryParamsHandling="merge"
            [queryParams]="{
              sort: null,
              dir: null
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
              dir: null
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
              dir: null
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
              dir: null
            }"
            #rla4="routerLinkActive"
            [active]="rla4.isActive"
          >
            Artists
          </a>
          <a
            mat-tab-link
            disableRipple
            routerLink="likes"
            fragment="top"
            routerLinkActive="active"
            queryParamsHandling="merge"
            [queryParams]="{
              sort: null,
              dir: null
            }"
            #rla5="routerLinkActive"
            [active]="rla5.isActive"
          >
            Likes
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
        /*margin-top: 32px;*/
        margin-top: -1px;
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
export class LibraryComponent implements OnInit {
  @ViewChild(MatTabNav)
  navBar!: MatTabNav;

  ngOnInit() {
    // eslint-disable-next-line no-underscore-dangle
    setTimeout(() => this.navBar._alignInkBarToSelectedTab(), 0);
  }
}
