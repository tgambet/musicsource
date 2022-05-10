import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { concatMap, Observable } from 'rxjs';
import { Song, SongId } from '@app/database/songs/song.model';
import {
  selectSongAll,
  selectSongByAlbumKey,
  selectSongByArtistKey,
  selectSongByKey,
  selectSongByKeys,
  selectSongIndexAll,
  selectSongTotal,
} from '@app/database/songs/song.selectors';
import { Update } from '@creasource/ngrx-idb';
import {
  addSong,
  updateSong,
  upsertSong,
} from '@app/database/songs/song.actions';
import { map, tap } from 'rxjs/operators';
import { SongIndex } from '@app/database/songs/song.reducer';
import { AlbumId } from '@app/database/albums/album.model';
import { ArtistId } from '@app/database/artists/artist.model';
import { DatabaseService } from '@app/database/database.service';
import { uniq } from '@app/core/utils/uniq.util';

@Injectable()
export class SongFacade {
  constructor(private store: Store, private database: DatabaseService) {}

  add(song: Song): Observable<IDBValidKey> {
    return this.database
      .add$<Song>('songs', song)
      .pipe(tap(() => this.store.dispatch(addSong({ song }))));
  }

  put(song: Song): Observable<IDBValidKey> {
    return this.database.db$.pipe(
      concatMap((db) => db.transaction$('songs', 'readwrite')),
      concatMap((transaction) => transaction.objectStore$<Song>('songs')),
      concatMap((store) =>
        store.get$(song.id).pipe(
          map((stored) =>
            stored
              ? {
                  ...stored,
                  entries: [...stored.entries, ...song.entries].filter(uniq()),
                }
              : song
          ),
          tap((updated) => this.store.dispatch(upsertSong({ song: updated }))),
          concatMap((updated) => store.put$(updated))
        )
      )
    );
  }

  getAll(index?: SongIndex): Observable<Song[]> {
    return index
      ? this.store.select(selectSongIndexAll(index))
      : this.store.select(selectSongAll);
  }

  getByKey(key: SongId): Observable<Song | undefined> {
    return this.store.select(selectSongByKey(key));
  }

  getByKeys(keys: SongId[]): Observable<Song[]> {
    return this.store.select(selectSongByKeys(keys));
  }

  getByArtistKey(key: ArtistId): Observable<Song[] | undefined> {
    return this.store.select(selectSongByArtistKey(key));
  }

  getByAlbumKey(key: AlbumId): Observable<Song[] | undefined> {
    return this.store
      .select(selectSongByAlbumKey(key))
      .pipe(
        map(
          (songs) =>
            songs &&
            songs.sort(
              (s1, s2) => (s1.tags.track.no || 0) - (s2.tags.track.no || 0)
            )
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
    const update = {
      likedOn: !!song.likedOn ? undefined : new Date().getTime(),
    };
    this.update({ key: song.id, changes: update });
  }
}
