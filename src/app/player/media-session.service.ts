import { Injectable } from '@angular/core';
import { Song } from '@app/database/songs/song.model';
import { PlayerFacade } from '@app/player/store/player.facade';
import { first, map, tap } from 'rxjs/operators';
import { PictureFacade } from '@app/database/pictures/picture.facade';
import { combineLatest, Observable, of } from 'rxjs';

@Injectable()
export class MediaSessionService {
  constructor(
    private player: PlayerFacade,
    private pictures: PictureFacade,
  ) {}

  setMetadata(song: Song): Observable<void> {
    if (!('mediaSession' in navigator)) {
      return of(void 0);
    }
    const mediaSession = navigator.mediaSession;

    return combineLatest([
      this.pictures.getSongCover(song, 264),
      this.player.hasPrevSong$(),
      this.player.hasNextSong$(),
    ]).pipe(
      first(),
      tap(([cover, hasPrev, hasNext]) => {
        mediaSession.metadata = new MediaMetadata({
          title: song.title,
          artist: song.artists.map((a) => a.name).join(', '),
          album: song.album.title,
          artwork: cover ? [{ src: cover }] : [],
        });
        if (hasPrev) {
          mediaSession.setActionHandler('previoustrack', () => {
            this.player.setPlaying();
            this.player.setPrevIndex();
          });
        } else {
          mediaSession.setActionHandler('previoustrack', null);
        }
        if (hasNext) {
          mediaSession.setActionHandler('nexttrack', () => {
            this.player.setPlaying();
            this.player.setNextIndex();
          });
        } else {
          mediaSession.setActionHandler('nexttrack', null);
        }
      }),
      map(() => void 0),
    );
  }
}
