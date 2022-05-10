import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Icons } from '@app/core/utils/icons.util';
import { MenuItem } from '@app/core/components/menu.component';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { SongFacade } from '@app/database/songs/song.facade';
import { HelperFacade } from '@app/helper/helper.facade';
import { SongId } from '@app/database/songs/song.model';

@Component({
  selector: 'app-playlist-likes',
  template: `
    <app-cover
      title="Your likes"
      [menuItems]="menuItems$ | async"
      [coverRouterLink]="['/playlist', 'likes']"
      [queue]="queue$ | async"
    >
      <app-icon-likes2></app-icon-likes2>
    </app-cover>
    <app-label
      [topLabel]="{
        text: 'Your Likes',
        routerLink: ['/playlist', 'likes']
      }"
      [bottomLabel]="'Auto playlist'"
      size="small"
    ></app-label>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      app-cover {
        margin-bottom: 16px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistLikesComponent implements OnInit {
  icons = Icons;

  menuItems$!: Observable<MenuItem[]>;

  queue$!: Observable<SongId[]>;

  constructor(private songs: SongFacade, private helper: HelperFacade) {}

  ngOnInit() {
    const songs$ = this.songs
      .getAll('likedOn')
      .pipe(map((songs) => [...songs].reverse()));

    this.queue$ = songs$.pipe(map((songs) => songs.map((s) => s.id)));

    this.menuItems$ = songs$.pipe(
      map((songs) => [
        {
          text: 'Shuffle play',
          icon: Icons.shuffle,
          click: () =>
            this.helper.playSongs(
              songs.map((s) => s.id),
              true
            ),
        },
        {
          text: 'Play next',
          icon: Icons.playlistPlay,
          click: () =>
            this.helper.addSongsToQueue(
              songs.map((s) => s.id),
              true,
              'Your likes will play next'
            ),
        },
        {
          text: 'Add to queue',
          icon: Icons.playlistPlus,
          click: () =>
            this.helper.addSongsToQueue(
              songs.map((s) => s.id),
              false,
              'Your likes have been added to queue'
            ),
        },
      ])
    );
  }
}
