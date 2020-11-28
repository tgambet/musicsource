import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';

@Component({
  selector: 'app-title',
  template: `
    <ng-container *ngIf="link">
      <a
        *ngIf="avatar"
        class="avatar"
        [ngClass]="avatarStyle"
        [routerLink]="link"
      >
        <img [src]="avatar" alt="avatar" aria-hidden="true" height="56" />
      </a>
    </ng-container>
    <ng-container *ngIf="!link">
      <div class="avatar" *ngIf="avatar" [ngClass]="avatarStyle">
        <img [src]="avatar" alt="avatar" aria-hidden="true" height="56" />
      </div>
    </ng-container>
    <div class="label">
      <p *ngIf="head">{{ head }}</p>
      <h1>
        <ng-container *ngIf="link">
          <a [routerLink]="link">{{ title }}</a>
          <a class="more" *ngIf="moreLink" [routerLink]="link">{{
            moreLink
          }}</a>
        </ng-container>
        <ng-container *ngIf="!link">
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

  @Input() link?: any[] | string | null | undefined;

  @Input() moreLink?: string;

  @Input() avatar?: string;

  @Input() avatarStyle: 'round' | 'square' = 'square';

  @HostBinding('class')
  @Input()
  size: 'small' | 'large' = 'large';
}
