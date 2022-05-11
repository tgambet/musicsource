import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-title',
  template: `
    <ng-container *ngIf="titleRouterLink">
      <a
        *ngIf="avatarSrc"
        class="avatar"
        [ngClass]="avatarStyle"
        [routerLink]="titleRouterLink"
      >
        <img
          [src]="avatarSrc"
          alt="avatar"
          aria-hidden="true"
          height="56"
          width="56"
        />
      </a>
    </ng-container>
    <ng-container *ngIf="!titleRouterLink">
      <div class="avatar" *ngIf="avatarSrc" [ngClass]="avatarStyle">
        <img
          [src]="avatarSrc"
          alt="avatar"
          aria-hidden="true"
          height="56"
          width="56"
        />
      </div>
    </ng-container>
    <div class="label">
      <p *ngIf="head">{{ head }}</p>
      <h1>
        <ng-container *ngIf="titleRouterLink">
          <a [routerLink]="titleRouterLink"><ng-content></ng-content></a>
          <a class="more" *ngIf="extraLinkLabel" [routerLink]="titleRouterLink">
            {{ extraLinkLabel }}
          </a>
        </ng-container>
        <ng-container *ngIf="!titleRouterLink">
          <ng-content></ng-content>
        </ng-container>
      </h1>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
      .avatar {
        margin-right: 16px;
        overflow: hidden;
      }
      .avatar.round {
        border-radius: 50%;
      }
      .label {
        display: flex;
        flex-direction: column;
      }
      .label a:focus {
        outline: none;
      }
      .more {
        color: #aaa;
        margin-left: 16px;
        padding: 0 8px;
        font-size: 14px;
        line-height: 1;
        text-transform: uppercase;
        font-family: Roboto, sans-serif;
        font-weight: 500;
        letter-spacing: 0;
      }
      .label .more:focus {
        outline: 1px solid #aaa;
      }
      .more:hover {
        text-decoration: none;
      }
      h1 {
        display: flex;
        align-items: baseline;
        margin: 0;
        font-family: 'YT Sans', sans-serif;
        /*letter-spacing: -0.45px;*/
      }
      p {
        margin-bottom: 2px;
        font-size: 16px;
        line-height: 19px;
        font-weight: 400;
        text-transform: uppercase;
        color: #aaa;
      }
      img {
        display: block;
      }
      a,
      a:visited {
        display: block;
        color: inherit;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      :host.large h1 {
        font-size: 45px;
        line-height: 54px;
      }
      :host.small h1 {
        font-size: 20px;
        line-height: 24px;
      }
      @media (min-width: 1150px) {
        :host.large h1 {
          font-size: 45px;
          line-height: 54px;
        }
        :host.small h1 {
          font-size: 24px;
          line-height: 28px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent {
  @Input() head?: string;

  @Input() titleRouterLink?: any[] | string | null | undefined;

  @Input() extraLinkLabel?: string;

  @Input() avatarSrc?: string;

  @Input() avatarStyle: 'round' | 'square' = 'square';

  @HostBinding('class')
  @Input()
  size: 'small' | 'large' = 'large';
}
