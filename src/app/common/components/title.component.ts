import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-title',
  template: `
    <ng-container *ngIf="routerLink">
      <a
        *ngIf="avatarSrc"
        class="avatar"
        [ngClass]="avatarStyle"
        [routerLink]="routerLink"
      >
        <img [src]="avatarSrc" alt="avatar" aria-hidden="true" height="56" />
      </a>
    </ng-container>
    <ng-container *ngIf="!routerLink">
      <div class="avatar" *ngIf="avatarSrc" [ngClass]="avatarStyle">
        <img [src]="avatarSrc" alt="avatar" aria-hidden="true" height="56" />
      </div>
    </ng-container>
    <div class="label">
      <p *ngIf="head">{{ head }}</p>
      <h1>
        <ng-container *ngIf="routerLink">
          <a [routerLink]="routerLink">{{ title }}</a>
          <a class="more" *ngIf="extraLinkLabel" [routerLink]="routerLink">{{
            extraLinkLabel
          }}</a>
        </ng-container>
        <ng-container *ngIf="!routerLink">
          {{ title }}
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
        font-size: 45px;
        line-height: 54px;
        letter-spacing: -0.45px;
      }
      p {
        margin: 0 0 2px;
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TitleComponent {
  @Input() title!: string;

  @Input() head?: string;

  @Input() routerLink?: any[] | string | null | undefined;

  @Input() extraLinkLabel?: string;

  @Input() avatarSrc?: string;

  @Input() avatarStyle: 'round' | 'square' = 'square';

  @HostBinding('class')
  @Input()
  size: 'small' | 'large' = 'large';
}
