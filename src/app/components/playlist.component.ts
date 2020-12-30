import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  Optional,
  Output,
  EventEmitter,
} from '@angular/core';
import { Icons } from '../utils/icons.util';
import { PlayerState } from './player-button.component';
import { Playlist } from '@app/models/playlist.model';
import { Observable } from 'rxjs';
import { LibraryFacade } from '@app/store/library/library.facade';
import { map, tap } from 'rxjs/operators';
import { getCover } from '@app/models/picture.model';
import { MenuItem } from '@app/components/menu.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-playlist',
  template: `
    <app-cover
      [title]="playlist.title"
      [menuItems]="menuItems"
      [coverRouterLink]="[]"
      [playerState]="state"
      (playClicked)="play()"
      (pauseClicked)="pause()"
      tabindex="-1"
    >
      <img
        [src]="cover"
        height="226"
        width="226"
        alt="cover"
        *ngIf="cover$ | async as cover; else icon"
      />
      <ng-template #icon>
        <app-icon [path]="icons.playlistPlay" [size]="72"></app-icon>
      </ng-template>
    </app-cover>
    <app-label
      [topLabel]="{ text: playlist.title, routerLink: [] }"
      [bottomLabel]="playlist.songs.length + ' songs'"
      size="small"
    ></app-label>
  `,
  styles: [
    `
      :host,
      img {
        display: block;
        max-width: 226px;
      }
      app-cover {
        margin-bottom: 16px;
        background-color: #4f4f4f;
      }
      app-icon {
        color: rgba(0, 0, 0, 0.2);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistComponent implements OnInit {
  @Input() playlist!: Playlist;

  @Output() update = new EventEmitter<Playlist>();

  icons = Icons;

  menuItems!: MenuItem[];

  state: PlayerState = 'stopped';

  cover$!: Observable<string | undefined>;

  constructor(
    private library: LibraryFacade,
    private snack: MatSnackBar,
    @Optional() private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateMenu();

    this.cover$ = this.library
      .getPicture(this.playlist.pictureKey)
      .pipe(map((picture) => (picture ? getCover(picture) : undefined)));
  }

  play() {
    this.state = 'loading';
    setTimeout(() => {
      this.state = 'playing';
      this.cdr.markForCheck();
    }, 1000);
  }

  pause() {
    this.state = 'stopped';
  }

  toggleLikePlaylist() {
    this.library
      .togglePlaylistFavorite(this.playlist)
      .pipe(
        tap(
          () =>
            (this.playlist.likedOn = !!this.playlist.likedOn
              ? undefined
              : new Date())
        ),
        tap(() => this.updateMenu()),
        tap(() => this.update.next(this.playlist)),
        tap(() =>
          this.snack.open(
            !!this.playlist.likedOn
              ? 'Added to your likes'
              : 'Removed from your likes'
          )
        )
      )
      // .pipe(tap(() => this.cdr.markForCheck()))
      .subscribe();
  }

  updateMenu() {
    this.menuItems = [
      {
        icon: Icons.shuffle,
        text: 'Shuffle play',
        click: () => alert('clicked'),
      },
      {
        icon: Icons.radio,
        text: 'Start radio',
      },
      {
        icon: Icons.pencil,
        text: 'Edit playlist',
      },
      {
        icon: Icons.playlistPlay,
        text: 'Play next',
        // click: () => (menuItems[0].icon = Icons.heartOutline),
      },
      {
        icon: Icons.playlistMusic,
        text: 'Add to queue',
      },
      {
        icon: !!this.playlist.likedOn ? Icons.heart : Icons.heartOutline,
        text: !!this.playlist.likedOn
          ? 'Remove from your likes'
          : 'Add to your likes',
        click: () => this.toggleLikePlaylist(),
      },
      {
        icon: Icons.playlistPlus,
        text: 'Add to playlist',
      },
      {
        icon: Icons.delete,
        text: 'Delete playlist',
      },
    ];
  }
}
