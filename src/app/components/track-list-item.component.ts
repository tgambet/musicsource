import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { SongWithCover$ } from '@app/models/song.model';

@Component({
  selector: 'app-track-list-item',
  template: `
    <span class="index">
      <span>{{ trackNumber }}</span>
      <app-player-button
        size="small"
        shape="square"
        (playClicked)="playClicked.emit()"
      ></app-player-button>
    </span>
    <span class="title">{{ song.title }}</span>
    <span class="duration">{{ song.duration | duration }}</span>
  `,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        flex: 0 0 58px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 8px;
      }
      :host:last-of-type {
        border: none;
      }
      .index {
        color: #aaa;
        flex: 0 0 32px;
        line-height: 32px;
        margin-right: 24px;
        text-align: center;
        position: relative;
        border-radius: 4px;
        overflow: hidden;
      }
      .index app-player-button {
        color: white;
        position: absolute;
        top: -4px;
        left: -4px;
      }
      app-player-button,
      :host:hover .index span {
        visibility: hidden;
      }
      :host:hover app-player-button {
        visibility: visible;
      }
      .title {
        flex: 1 1 auto;
      }
      .duration {
        color: #aaa;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackListItemComponent {
  @Input() song!: SongWithCover$;
  @Input() trackNumber!: number;

  @Output() playClicked = new EventEmitter<void>();

  constructor() {}
}
