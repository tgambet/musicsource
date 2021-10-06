import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Song } from '@app/database/songs/song.model';
import {
  selectSongByAlbumKey,
  selectSongByKey,
  selectSongByKeys,
  selectSongTotal,
} from '@app/database/songs/song.selectors';
import { Update } from '@creasource/ngrx-idb';
import { updateSong } from '@app/database/songs/song.actions';
import { map } from 'rxjs/operators';

@Injectable()
export class SongFacade {
  constructor(private store: Store) {}

  getByKey(key: string): Observable<Song | undefined> {
    return this.store.select(selectSongByKey(key));
  }

  getByKeys(keys: string[]): Observable<Song[]> {
    return this.store.select(selectSongByKeys(keys));
  }

  getByAlbumKey(key: string): Observable<Song[]> {
    return this.store.select(selectSongByAlbumKey(key)).pipe(
      map((songs) => songs || []),
      map((songs) =>
        songs.sort((s1, s2) => (s1.track.no || 0) - (s2.track.no || 0))
      )
    );
    // getAlbumTitles = (album: Album): Observable<Song> =>
    //   this.getSongs('albumHash', album.hash).pipe(map(({ value }) => value));
    // this.getAlbumTitles(album).pipe(
    //   toArray(),
    //   map((songs) =>
    //     songs.sort((s1, s2) => (s1.track.no || 0) - (s2.track.no || 0))
    //   )
    // )
  }

  getTotal(): Observable<number> {
    return this.store.select(selectSongTotal);
  }

  update(update: Update<Song>): void {
    this.store.dispatch(updateSong({ update }));
  }

  toggleLiked(song: Song): void {
    const update = { likedOn: !!song.likedOn ? undefined : new Date() };
    this.update({ key: song.entryPath, changes: update });
  }
}
