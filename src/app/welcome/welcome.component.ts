import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Icons } from '@app/core/utils';
import { openDirectory, scanStart } from '@app/scanner/store/scanner.actions';

@Component({
  selector: 'app-welcome',
  template: `
    <div class="top-bar">
      <h1>
        <app-icon [path]="icons.album" [size]="40"></app-icon>
        <span>MusicSource</span>
      </h1>
      <a href="https://github.com" aria-label="Github">
        <app-icon [path]="icons.code" [size]="36"></app-icon>
      </a>
    </div>
    <div class="section home">
      <div class="container">
        <div class="left action">
          <app-title>MusicSource</app-title>
          <p>
            A modern player for your personal music library, without leaving
            your browser.
          </p>
          <button mat-raised-button color="accent" (click)="scan()">
            <span class="button">
              <app-icon [path]="icons.folderMusic" [size]="24"></app-icon>
              Scan My Library
            </span>
          </button>
          <a mat-raised-button href="https://github.com">
            <span class="button">
              <app-icon [path]="icons.code" [size]="24"></app-icon>
              View Source Code
            </span>
          </a>
        </div>
        <div class="right picture">
          <app-h-list class="carousel" [borderRadius]="4">
            <img
              src="assets/home.webp"
              alt="musicsource"
              appHListItem
              width="683"
            />
            <div
              style="width:683px; background-color: #101010"
              appHListItem
            ></div>
            <div
              style="width:683px; background-color: #151515"
              appHListItem
            ></div>
            <div
              style="width:683px; background-color: #202020"
              appHListItem
            ></div>
            <img
              src="assets/home.webp"
              alt="musicsource"
              appHListItem
              width="683"
            />
          </app-h-list>
        </div>
      </div>
    </div>
    <div class="section features">
      <div class="container">
        <div class="left"></div>
        <div class="right">
          <app-title>Features</app-title>
          <ul>
            <li><div class="li"></div></li>
            <li><div class="li"></div></li>
            <li><div class="li"></div></li>
            <li><div class="li"></div></li>
          </ul>
        </div>
      </div>
    </div>
    <footer>
      <app-icon [path]="icons.album" [size]="40"></app-icon>
      <p>
        <app-title size="small">MusicSource</app-title>
        <span>Copyright © 2021, CreaSource</span>
      </p>
    </footer>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background-color: #101010;
      }
      .top-bar {
        flex: 0 0 64px;
        display: flex;
        flex-direction: row;
        align-items: center;
        /*flex: 0 0 64px;*/
        padding: 0 24px 0 12px;
        box-sizing: border-box;
        width: 100vw;
        height: 64px;
        white-space: nowrap;
        z-index: 100;
        font-weight: 500;
        font-size: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        background-color: #161616;
      }
      h1 {
        font-family: 'YT Sans', sans-serif;
        letter-spacing: -1px;
        font-size: 32px;
        margin-right: auto;
        display: flex;
        align-items: center;
      }
      h1 app-icon {
        margin-right: 8px;
      }
      .section {
        flex: 0 0 85vh;
        justify-content: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
      }
      .container {
        display: flex;
        align-items: center;
        width: 100%;
        max-width: 1380px;
        margin: 64px;
      }
      .home {
        background: repeating-linear-gradient(-45deg, #00000000, #161616 8px),
          linear-gradient(-45deg, #363636, #161616 60%, #161616 100%);
      }
      .left {
        flex: 0 0 50%;
      }
      .action {
        flex: 0 0 45%;
        margin-right: 32px;
      }
      .action p {
        margin: 12px 0 24px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.5);
      }
      [mat-raised-button] {
        padding-left: 12px;
        margin: 0 12px 0 0;
      }
      .button {
        display: flex;
        align-items: center;
        text-transform: uppercase;
      }
      .button app-icon {
        margin-right: 8px;
      }
      .right {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        height: 100%;
        position: relative;
      }
      .carousel {
        width: 683px;
        box-shadow: -5px -5px 20px rgba(0, 0, 0, 0.75);
        outline: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }
      .features {
        background-color: #161616;
      }
      .features ul {
        list-style-type: none;
        margin: 36px 0 0 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
      }
      .features li {
        flex: 1 1 50%;
        border-radius: 4px;
        box-sizing: border-box;
        padding: 6px;
      }
      .features .li {
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        box-sizing: border-box;
        background-color: #222222;
        height: 200px;
      }
      footer {
        flex: 0 0 auto;
        box-sizing: border-box;
        padding: 24px;
        display: flex;
        align-items: center;
      }
      footer p {
        display: flex;
        flex-direction: column;
        margin-left: 12px;
      }
      footer span {
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  icons = Icons;

  constructor(private router: Router, private store: Store) {}

  scan(): void {
    this.router.navigate(['library']).then(() => {
      this.store.dispatch(scanStart());
      this.store.dispatch(openDirectory());
    });
  }
}
