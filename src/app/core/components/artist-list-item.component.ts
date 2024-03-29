import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Artist } from '@app/database/artists/artist.model';
import { Icons } from '@app/core/utils';
import { Observable } from 'rxjs';
import { PictureFacade } from '@app/database/pictures/picture.facade';

@Component({
  selector: 'app-artist-list-item',
  template: `
    <a [routerLink]="['/', 'artist', artist.id]" matRipple>
      <div class="cover">
        <img
          *ngIf="cover$ | async as cover; else icon"
          [src]="cover"
          [alt]="artist.name"
        />
        <ng-template #icon>
          <app-icon [path]="icons.account" [size]="56"></app-icon>
        </ng-template>
      </div>
      <div class="meta">
        <span>{{ artist.name }}</span>
      </div>
    </a>
    <div class="controls">
      <button
        [class.liked]="!!artist.likedOn"
        mat-icon-button
        [disableRipple]="true"
        (click)="toggleLiked.emit()"
        class="liked"
      >
        <app-icon
          [path]="!!artist.likedOn ? icons.heart : icons.heartOutline"
        ></app-icon>
      </button>
      <button
        class="trigger"
        aria-label="Other actions"
        title="Other actions"
        mat-icon-button
        [disableRipple]="true"
        [matMenuTriggerFor]="menu"
        #trigger="matMenuTrigger"
        (click)="$event.stopPropagation()"
      >
        <app-icon [path]="icons.dotsVertical" [size]="24"></app-icon>
      </button>
    </div>
    <mat-menu #menu="matMenu" [overlapTrigger]="true">
      <ng-template matMenuContent>
        <button mat-menu-item (click)="shufflePlay.emit()">
          <app-icon [path]="icons.shuffle"></app-icon>
          <span>Shuffle play</span>
        </button>
      </ng-template>
    </mat-menu>
  `,
  styles: [
    `
      :host {
        flex: 0 0 80px;
        position: relative;
      }
      :host a {
        display: flex;
        align-items: center;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 104px 0 8px;
        height: 80px;
        text-decoration: none;
      }
      :host:last-of-type a {
        border: none;
      }
      .cover {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 16px;
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      app-icon {
        color: grey;
      }
      .liked app-icon {
        color: white;
      }
      .meta {
        display: flex;
        flex-direction: column;
      }
      .controls {
        color: #aaa;
        position: absolute;
        top: 50%;
        right: 8px;
        transform: translateY(-50%);
      }
      .controls button:not(:last-of-type) {
        margin-right: 8px;
      }
      .controls button:not(.liked) {
        opacity: 0;
      }
      :host:hover .controls button,
      :host.cdk-focused .controls button {
        opacity: 1;
      }
      /*.artist ~ .empty {*/
      /*  display: none;*/
      /*}*/
      /*.empty {*/
      /*  color: #aaa;*/
      /*  padding: 24px 0;*/
      /*  text-align: center;*/
      /*}*/
      .mat-menu-item app-icon {
        margin-right: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArtistListItemComponent implements OnInit {
  @Input() artist!: Artist;
  @Output() toggleLiked = new EventEmitter<void>();
  @Output() shufflePlay = new EventEmitter<void>();

  icons = Icons;

  cover$!: Observable<string | undefined>;

  constructor(private pictures: PictureFacade) {}

  ngOnInit(): void {
    this.cover$ = this.pictures.getArtistCover(this.artist.id, 56);
  }
}
