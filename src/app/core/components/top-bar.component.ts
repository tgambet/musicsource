import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icons } from '@app/core/utils';
import { MenuItem } from './menu.component';
import { Router } from '@angular/router';
import { DatabaseService } from '@app/database/database.service';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { removeAllAlbums } from '@app/database/albums/album.actions';
import { removeAllArtists } from '@app/database/artists/artist.actions';
import { removeAllEntries } from '@app/database/entries/entry.actions';
import { removeAllPictures } from '@app/database/pictures/picture.actions';
import { removeAllPlaylists } from '@app/database/playlists/playlist.actions';
import { removeAllSongs } from '@app/database/songs/song.actions';
import { openDirectory, scanStart } from '@app/scanner/store/scanner.actions';

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
    <app-menu
      [menuItems]="menuItems"
      [hasBackdrop]="true"
      [disabled]="false"
      [triggerIcon]="icons.dotsVertical"
    ></app-menu>
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
        background: #000;
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
      /*:host-context(.cdk-global-scrollblock) {*/
      /*  background: #000;*/
      /*  border-bottom: 1px solid rgba(255, 255, 255, 0.1);*/
      /*}*/
      /*:host-context(.with-background) {*/
      /*  background: #000;*/
      /*  border-bottom: none;*/
      /*}*/
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
      text: 'Clear database',
      icon: Icons.delete,
      click: (): void => this.clear(),
    },
    {
      text: 'Quick scan a folder',
      icon: Icons.folderSearch,
      click: (): void => {
        this.store.dispatch(scanStart());
        this.store.dispatch(openDirectory());
      },
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

  constructor(
    private router: Router,
    private store: Store,
    private storage: DatabaseService
  ) {}

  // scan(): void {
  //   this.scanner.openDirectory();
  //   // this.router
  //   //   .navigate([{ outlets: { dialog: ['scan'] } }], {
  //   //     skipLocationChange: true,
  //   //   })
  //   //   .then(() => this.store.dispatch(openDirectory()));
  // }

  clear(): void {
    this.store.dispatch(removeAllAlbums());
    this.store.dispatch(removeAllArtists());
    this.store.dispatch(removeAllEntries());
    this.store.dispatch(removeAllPictures());
    this.store.dispatch(removeAllPlaylists());
    this.store.dispatch(removeAllSongs());
    this.storage
      .clear$()
      .pipe(
        tap(() => localStorage.clear()),
        tap(() => this.router.navigate(['/welcome']))
      )
      .subscribe();
  }
}
