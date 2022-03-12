import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Directive,
} from '@angular/core';
import { BottomLabel } from '@app/core/components/label.component';
import { Icons } from '@app/core/utils';
import { Observable } from 'rxjs';
import { MatRipple } from '@angular/material/core';
import { Router } from '@angular/router';

export interface ListItem {
  title: string;
  label: BottomLabel;
  cover$: Observable<string | undefined>;
  routerLink?: any[] | null;
}

@Directive({
  selector: '[appMatRipple]',
})
export class OptMatRippleDirective extends MatRipple implements OnInit {
  @Input() appMatRipple = true;
  override ngOnInit(): void {
    super.ngOnInit();
    if (!this.appMatRipple) {
      super.disabled = true;
    }
  }
}

@Component({
  selector: 'app-list',
  template: `
    <div
      *ngFor="let item of items"
      class="item"
      [appMatRipple]="!!item.routerLink"
      [class.cursor]="!!item.routerLink"
      (click)="goTo(item.routerLink)"
    >
      <div class="cover">
        <div class="inner-cover" [class.round]="round">
          <img
            *ngIf="item.cover$ | async as cover; else icon"
            [src]="cover"
            alt="cover"
          />
          <ng-template #icon>
            <app-icon [path]="defaultIcon" [size]="26"></app-icon>
          </ng-template>
          <!--        <app-player-button-->
          <!--          size="small"-->
          <!--          [queue]="queue"-->
          <!--          [index]="queue.indexOf(song.entryPath)"-->
          <!--          *ngIf="queue"-->
          <!--        ></app-player-button>-->
        </div>
      </div>
      <div class="meta">
        <app-label
          size="large"
          align="left"
          [bottomLabel]="item.label"
          [topLabel]="item.title"
        ></app-label>
      </div>
      <div class="controls"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .item {
        flex: 0 0 80px;
        display: flex;
        align-items: center;
      }
      .item:not(:last-child) {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .cursor {
        cursor: pointer;
      }
      .cover {
        flex: 0 0 72px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
      }
      img {
        display: block;
      }
      .inner-cover {
        overflow: hidden;
        border-radius: 2px;
        background-color: rgba(255, 255, 255, 0.1);
        height: 56px;
        width: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .inner-cover.round {
        border-radius: 50%;
      }
      .meta {
        flex: 1 1 auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent {
  @Input() items: ListItem[] = [];
  @Input() round = false;
  @Input() defaultIcon = Icons.fileMusic;

  icons = Icons;

  constructor(private router: Router) {}

  goTo(routerLink: any[] | null | undefined) {
    if (routerLink) {
      this.router.navigate(routerLink);
    }
  }
}
