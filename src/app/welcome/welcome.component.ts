import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Icons } from '@app/core/utils';
import { openDirectory } from '@app/scanner/store/scanner.actions';
import { SupportService } from '@app/welcome/support.service';

@Component({
  selector: 'app-welcome',
  template: `
    <div class="top-bar">
      <h1>
        <app-icon [path]="icons.album" [size]="40"></app-icon>
        <span>MusicSource</span>
      </h1>
      <a href="https://github.com/tgambet/musicsource" aria-label="Github">
        <app-icon [path]="icons.code" [size]="36"></app-icon>
      </a>
    </div>
    <div class="section home">
      <div class="left action">
        <app-title>MusicSource</app-title>
        <p class="sub-line">
          A modern desktop player for your personal music library.
        </p>
        <p class="support" *ngIf="!supported">
          You current browser or device does not support this application.
        </p>
        <button
          mat-raised-button
          color="accent"
          (click)="scan()"
          [disabled]="!supported"
        >
          <span class="button">
            <app-icon [path]="icons.folderMusic" [size]="24"></app-icon>
            <div class="text">
              <span>Scan My Library</span>
              <span>Select a folder to scan for music</span>
            </div>
          </span>
        </button>
        <a mat-raised-button href="https://github.com/tgambet/musicsource">
          <div class="button">
            <app-icon [path]="icons.codeTag" [size]="24"></app-icon>
            <div class="text">
              <span>View Source Code</span>
              <span>MusicSource is open source!</span>
            </div>
          </div>
        </a>
      </div>
      <div class="right picture" style="--aspect-ratio:1.274875621890547">
        <app-h-list class="carousel" [borderRadius]="4">
          <img src="assets/welcome/w2.webp" alt="musicsource" appHListItem />
          <img src="assets/welcome/w3.webp" alt="musicsource" appHListItem />
          <img src="assets/welcome/w4.webp" alt="musicsource" appHListItem />
          <img src="assets/welcome/w5.webp" alt="musicsource" appHListItem />
          <img src="assets/welcome/w6.webp" alt="musicsource" appHListItem />
          <img src="assets/welcome/w1.webp" alt="musicsource" appHListItem />
        </app-h-list>
      </div>
    </div>
    <!--    <div class="section features">-->
    <!--      <div class="left"></div>-->
    <!--      <div class="right">-->
    <!--        <app-title>Features</app-title>-->
    <!--        <ul>-->
    <!--          <li><div class="li"></div></li>-->
    <!--          <li><div class="li"></div></li>-->
    <!--          <li><div class="li"></div></li>-->
    <!--          <li><div class="li"></div></li>-->
    <!--        </ul>-->
    <!--      </div>-->
    <!--    </div>-->
    <footer>
      <app-icon [path]="icons.album" [size]="40"></app-icon>
      <p>
        <app-title size="small">MusicSource</app-title>
        <span>Created by Thomas Gambet</span>
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
        flex: 1 0 auto;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .left {
        flex: 0 1 auto;
      }
      .right {
        flex: 0 1 auto;
        position: relative;
        width: 100%;
      }
      .home {
        background: repeating-linear-gradient(-45deg, #00000000, #161616 8px),
          linear-gradient(-45deg, #363636, #161616 60%, #161616 100%);
        padding: 32px;
        justify-content: space-evenly;
      }
      .home .right {
        max-width: 1025px;
      }
      .action {
        text-align: center;
        margin-bottom: 32px;
      }
      .action app-title {
        justify-content: center;
      }
      .action p {
        margin: 12px 0 24px;
        line-height: 1.5;
        color: rgba(255, 255, 255, 0.5);
      }
      .sub-line {
        font-size: 1.25em;
      }
      [mat-raised-button] {
        padding-left: 12px;
        margin: 0 12px 16px 0;
        min-width: 230px;
      }
      .button {
        display: flex;
        align-items: center;
      }
      .button app-icon {
        margin-right: 8px;
      }
      .button .text {
        display: flex;
        flex-direction: column;
        text-align: left;
        line-height: 16px;
        padding: 8px 0;
      }
      .button .text span:first-child {
        text-transform: uppercase;
      }
      .button .text span:last-child {
        font-size: 12px;
        font-weight: 300;
      }
      .carousel {
        box-shadow: -5px -5px 20px rgba(0, 0, 0, 0.75);
        /*outline: 1px solid rgba(255, 255, 255, 0.1);*/
        border-radius: 4px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      img {
        image-rendering: smooth;
      }
      .carousel img:focus {
        outline: none;
      }
      .support {
        font-weight: bold;
        color: #e53935 !important;
      }
      /*
      .right {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        justify-content: center;
        position: relative;
      }
      .carousel {
        box-shadow: -5px -5px 20px rgba(0, 0, 0, 0.75);
        outline: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }
      .carousel {
        width: 450px;
      }
      .carousel img {
        width: 450px;
      }
      .features {
        background-color: #161616;
      }
      .features .left {
        order: 2;
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
      }*/
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
      @media (min-width: 1024px) {
        .home {
          flex-direction: row;
          flex: 1 1 auto;
        }
        .home .right {
          width: auto;
          flex-basis: 60%;
        }
        .home .left {
          text-align: left;
          margin-right: 16px;
        }
        .home .left app-title {
          justify-content: flex-start;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  icons = Icons;

  supported = false;

  constructor(private store: Store, private support: SupportService) {
    this.supported = support.checkFileSystemSupport();
  }

  scan(): void {
    this.store.dispatch(openDirectory({}));
  }
}
