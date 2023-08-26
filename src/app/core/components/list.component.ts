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
import { MenuItem } from '@app/core/components/menu.component';
import { SongId } from '@app/database/songs/song.model';
import { HelperFacade } from '@app/helper/helper.facade';

export interface ListItem {
  title: string;
  label: BottomLabel;
  cover$: Observable<string | undefined>;
  routerLink?: any[] | null;
  menuItems: MenuItem[];
  queue$?: Observable<SongId[]>;
  border$?: Observable<string | undefined>;
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
      *ngFor="let item of items; trackBy: trackBy"
      class="item"
      [appMatRipple]="!!item.routerLink"
      [class.cursor]="!!item.routerLink"
      (click)="goTo(item.routerLink)"
    >
      <div class="cover">
        <div class="inner-cover" [class.round]="round">
          <ng-container *ngIf="item.cover$ | async as cover; else icon">
            <div
              class="back-cover"
              [style.backgroundColor]="item.border$ | async"
              *ngIf="!!item.border$"
            >
              <img [src]="cover" alt="cover" />
            </div>
            <img [src]="cover" alt="cover" />
          </ng-container>
          <ng-template #icon>
            <app-icon [path]="defaultIcon" [size]="26"></app-icon>
          </ng-template>
          <app-player-button
            class="player-button"
            (mousedown)="$event.stopPropagation()"
            (click)="$event.stopPropagation()"
            *ngIf="item.queue$ | async as queue"
            size="small"
            [queue]="queue"
          ></app-player-button>
        </div>
      </div>
      <div class="meta">
        <app-label
          size="large"
          align="left"
          [bottomLabel]="item.label"
          [topLabel]="item.title"
          *ngIf="item.queue$ | async as queue; else label"
          (topLabelClick)="play(queue)"
          [topLabelClickable]="true"
        ></app-label>
        <ng-template #label>
          <app-label
            size="large"
            align="left"
            [bottomLabel]="item.label"
            [topLabel]="item.title"
          ></app-label>
        </ng-template>
      </div>
      <div class="controls">
        <app-menu
          [menuItems]="item.menuItems"
          [disableRipple]="true"
          (mousedown)="$event.stopPropagation()"
        ></app-menu>
      </div>
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
        position: relative;
      }
      .player-button {
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.75);
        display: flex;
        align-items: center;
        justify-content: center;
        border-width: 12px;
      }
      .player-button.stopped {
        display: none;
      }
      .item:hover .player-button {
        display: flex;
      }
      .inner-cover.round {
        border-radius: 50%;
      }
      .meta {
        flex: 1 1 auto;
      }
      .controls {
        display: none;
        color: #aaa;
      }
      .item:hover .controls {
        display: initial;
      }
      .back-cover {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        padding: 16.6%;
      }
      .back-cover img {
        width: 100%;
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

  constructor(
    private router: Router,
    private helper: HelperFacade,
  ) {}

  goTo(routerLink: any[] | null | undefined) {
    if (routerLink) {
      this.router.navigate(routerLink);
    }
  }

  play(queue: SongId[]): void {
    this.helper.playQueue(queue, 0);
  }

  trackBy(index: number, item: ListItem): string {
    return item.title;
  }
}
