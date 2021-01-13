import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { Icons } from '../utils/icons.util';
import { PlayerState } from './player-button.component';
import { AlbumWithCover$ } from '@app/models/album.model';
import { hash } from '@app/utils/hash.util';
import { MatMenuTrigger } from '@angular/material/menu';
import { MenuItem } from '@app/components/menu.component';
import { PlayerFacade } from '@app/store/player/player.facade';
import { ComponentHelperService } from '@app/services/component-helper.service';
import { LibraryFacade } from '@app/store/library/library.facade';
import { concatMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-album',
  template: `
    <app-cover
      [title]="album.name"
      [menuItems]="menuItems"
      [coverRouterLink]="['/', 'album', album.hash]"
      [playerState]="state"
      (playClicked)="play()"
      (pauseClicked)="pause()"
      (menuOpened)="menuOpened.emit($event)"
      tabindex="-1"
    >
      <img
        *ngIf="album.cover$ | async as cover; else icon"
        [src]="cover"
        [alt]="album.name"
      />
      <ng-template #icon>
        <app-icon [path]="icons.album" [fullWidth]="true"></app-icon>
      </ng-template>
    </app-cover>
    <app-label
      [topLabel]="{ text: album.name, routerLink: ['/', 'album', album.hash] }"
      [bottomLabel]="[
        'Album',
        album.albumArtist
          ? {
              text: album.albumArtist,
              routerLink: ['/', 'artist', getHash(album.albumArtist)]
            }
          : album.artists.length > 1
          ? 'Various artists'
          : undefined,
        album.year ? album.year.toString(10) : ''
      ]"
      [size]="size"
    ></app-label>
  `,
  styles: [
    `
      :host,
      img {
        display: block;
        width: 100%;
      }
      app-cover {
        margin-bottom: 16px;
        background-color: rgba(255, 255, 255, 0.1);
      }
      app-icon {
        color: rgba(255, 255, 255, 0.5);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlbumComponent implements OnInit {
  @Input() album!: AlbumWithCover$;
  @Input() size: 'small' | 'large' = 'large';
  @Output() menuOpened = new EventEmitter<MatMenuTrigger>();
  icons = Icons;
  menuItems!: MenuItem[];
  state: PlayerState = 'stopped';

  constructor(
    private library: LibraryFacade,
    private player: PlayerFacade,
    private helper: ComponentHelperService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.menuItems = [
      {
        icon: Icons.shuffle,
        text: 'Shuffle play',
        click: () => {
          this.library
            .getAlbumTracks(this.album)
            .pipe(
              tap((tracks) => {
                this.player.setPlaying(true);
                this.player.setPlaylist(tracks);
                this.player.shuffle();
                this.player.show();
              })
            )
            .subscribe();
        },
      },
      {
        icon: Icons.playlistPlay,
        text: 'Play next',
        click: () => {
          this.library
            .getAlbumTracks(this.album)
            .pipe(
              tap((tracks) => {
                this.player.addToPlaylist(tracks, true);
                this.player.show();
              })
            )
            .subscribe();
        },
      },
      {
        icon: Icons.playlistMusic,
        text: 'Add to queue',
        click: () => {
          this.library
            .getAlbumTracks(this.album)
            .pipe(
              tap((tracks) => {
                this.player.addToPlaylist(tracks);
                this.player.show();
              })
            )
            .subscribe();
        },
      },
      {
        icon: Icons.heartOutline,
        text: 'Add to your likes',
        click: () => {
          this.helper
            .toggleLikedAlbum(this.album)
            .subscribe(() => this.cdr.markForCheck());
        },
      },
      {
        icon: Icons.playlistPlus,
        text: 'Add to playlist',
        click: () => {
          this.library
            .getAlbumTracks(this.album)
            .pipe(concatMap((tracks) => this.helper.addSongsToPlaylist(tracks)))
            .subscribe();
        },
      },
      {
        icon: Icons.accountMusic,
        text: 'Go to artist',
        routerLink: this.album.albumArtist
          ? ['/', 'artist', this.getHash(this.album.albumArtist)]
          : undefined,
        disabled: !this.album.albumArtist,
      },
    ];
  }

  play() {
    this.library
      .getAlbumTracks(this.album)
      .pipe(
        tap((tracks) => {
          this.player.setPlaying(true);
          this.player.setPlaylist(tracks);
          this.player.show();
        })
      )
      .subscribe();
  }

  pause() {}

  getHash(s: string): string {
    return hash(s);
  }
}
