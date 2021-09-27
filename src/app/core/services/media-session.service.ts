import { Injectable } from '@angular/core';
import { SongWithCover$ } from '@app/core/song/song.model';
import { tap } from 'rxjs/operators';
import { PlayerFacade } from '@app/player/store/player.facade';

@Injectable()
export class MediaSessionService {
  constructor(private player: PlayerFacade) {}

  init(): void {
    if ('mediaSession' in navigator) {
      const mediaSession = navigator.mediaSession as MediaSession;
      mediaSession.setActionHandler('play', () => this.player.resume());
      mediaSession.setActionHandler('pause', () => this.player.pause());
      mediaSession.setActionHandler('stop', () => this.player.pause()); // TODO reset & hide player
      // mediaSession.setActionHandler('seekbackward', () => {});
      // mediaSession.setActionHandler('seekforward', () => {});
      // mediaSession.setActionHandler('seekto', () => {});
      this.player.hasNextSong$().subscribe((hasNext) => {
        if (hasNext) {
          mediaSession.setActionHandler('nexttrack', () => {
            this.player.setPlaying();
            this.player.setNextIndex();
          });
        } else {
          mediaSession.setActionHandler('nexttrack', null);
        }
      });
      this.player.hasPrevSong$().subscribe((hasPrev) => {
        if (hasPrev) {
          mediaSession.setActionHandler('previoustrack', () => {
            this.player.setPlaying();
            this.player.setPrevIndex();
          });
        } else {
          mediaSession.setActionHandler('previoustrack', null);
        }
      });
    }
  }

  setMetadata(song: SongWithCover$): void {
    if ('mediaSession' in navigator) {
      song.cover$
        .pipe(
          tap(
            (cover) =>
              ((navigator.mediaSession as MediaSession).metadata =
                new MediaMetadata({
                  title: song.title,
                  artist: song.artist,
                  album: song.album,
                  artwork: cover ? [{ src: cover }] : [],
                }))
          )
        )
        .subscribe();
    }
  }
}
