import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icons } from '../utils/icons.util';
import { MenuItem } from './menu.component';
import { Router } from '@angular/router';
import { ScannerFacade } from '@app/store/scanner/scanner.facade';

@Component({
  selector: 'app-top-bar',
  template: `
    <h1>
      <app-icon [path]="icons.album" [size]="40"></app-icon>
      <span>MusicSource</span>
    </h1>
    <nav>
      <!--      <a routerLink="/home" routerLinkActive="active">-->
      <!--        <app-icon [path]="icons.home"></app-icon>-->
      <!--        <span>Home</span>-->
      <!--      </a>-->
      <a routerLink="/library" routerLinkActive="active">
        <app-icon [path]="icons.library"></app-icon>
        <span>Library</span>
      </a>
      <!--      <a routerLink="/search" routerLinkActive="active">-->
      <!--        <app-icon [path]="icons.search" class="search"></app-icon>-->
      <!--        <span>Search</span>-->
      <!--      </a>-->
    </nav>
    <app-menu [menuItems]="menuItems" [hasBackdrop]="true"></app-menu>
  `,
  styles: [
    `
      :host {
        position: sticky;
        top: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        /*flex: 0 0 64px;*/
        padding: 0 24px 0 12px;
        box-sizing: border-box;
        width: 100vw;
        white-space: nowrap;
        background: rgb(33, 33, 33);
        z-index: 100;
        font-weight: 500;
        font-size: 20px;
        transition: background-color ease 200ms;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      :host-context(.scrolled-top) {
        background: transparent;
        border-bottom: none;
      }
      :host-context(.cdk-global-scrollblock) {
        background: rgb(33, 33, 33);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      :host-context(.with-background) {
        background: rgb(33, 33, 33);
        border-bottom: none;
      }
      h1 {
        font-family: 'YT Sans', sans-serif;
        letter-spacing: -1px;
        font-size: 32px;
        margin-right: 16px;
        display: flex;
        align-items: center;
      }
      h1 span {
        display: none;
      }
      h1 app-icon {
        margin-right: 8px;
      }
      nav {
        display: flex;
        margin: 0 auto;
      }
      a {
        text-decoration: none;
        padding: 8px;
        margin: 0 16px;
        display: flex;
        align-items: center;
        color: rgba(255, 255, 255, 0.5);
      }
      a:hover,
      a.active {
        color: white;
        text-decoration: none;
      }
      a span {
        display: none;
      }
      @media (min-width: 600px) {
        nav app-icon:not(.search) {
          display: none;
        }
        nav app-icon.search {
          margin-right: 8px;
        }
        a span {
          display: initial;
        }
      }
      @media (min-width: 755px) {
        h1 span {
          display: initial;
        }
        app-menu {
          margin-left: 155px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBarComponent {
  icons = Icons;
  menuItems: MenuItem[] = [
    {
      text: 'Quick scan a folder',
      icon: Icons.folderSearch,
      click: () => this.scan(),
    },
    // {
    //   text: 'Library settings',
    //   icon: Icons.folderCog,
    //   routerLink: [{ outlets: { dialog: ['settings'] } }],
    // },
    // { text: 'History', icon: Icons.history },
    // { text: 'Settings', icon: Icons.cog },
    // { text: 'Privacy policy', icon: Icons.security },
    // { text: 'Help', icon: Icons.helpCircle },
    // { text: 'Send feedback', icon: Icons.messageAlert },
    // { text: 'Offer me a job or a beer', icon: Icons.currencyUsd },
  ];

  constructor(private router: Router, private scanner: ScannerFacade) {}

  scan() {
    this.scanner.openDirectory();
    // this.router
    //   .navigate([{ outlets: { dialog: ['scan'] } }], {
    //     skipLocationChange: true,
    //   })
    //   .then(() => this.store.dispatch(openDirectory()));
  }
}
