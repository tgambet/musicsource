import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Song } from '@app/models/song.model';

@Component({
  selector: 'app-song-list',
  template: `
    <div class="song" *ngFor="let song of songs; let i = index">
      <span class="index">{{ i + 1 }}</span>
      <span class="title">{{ song.title }}</span>
      <span class="duration">{{ song.duration | duration }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
      }
      .song {
        display: flex;
        align-items: center;
        flex: 0 0 58px;
        box-sizing: border-box;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 0 8px;
      }
      .song:last-of-type {
        border: none;
      }
      .index {
        color: #aaa;
        flex: 0 0 32px;
        margin-right: 24px;
        text-align: center;
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
export class SongListComponent {
  @Input() songs!: Song[];
}
