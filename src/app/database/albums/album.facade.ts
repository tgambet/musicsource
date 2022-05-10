import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { concatMap, Observable } from 'rxjs';
import { Album, AlbumId } from '@app/database/albums/album.model';
import {
  selectAlbumByAlbumArtistKey,
  selectAlbumByArtistKey,
  selectAlbumByKey,
  selectAlbumIndexAll,
  selectAlbumTotal,
} from '@app/database/albums/album.selectors';
import {
  addAlbum,
  updateAlbum,
  upsertAlbum,
} from '@app/database/albums/album.actions';
import { AlbumIndex } from '@app/database/albums/album.reducer';
import { map, tap } from 'rxjs/operators';
import { IdUpdate } from '@app/core/utils';
import { ArtistId } from '@app/database/artists/artist.model';
import { DatabaseService } from '@app/database/database.service';

@Injectable()
export class AlbumFacade {
  constructor(private store: Store, private database: DatabaseService) {}

  add(album: Album): Observable<IDBValidKey> {
    return this.database
      .add$<Album>('albums', album)
      .pipe(tap(() => this.store.dispatch(addAlbum({ album }))));
  }

  put(album: Album): Observable<IDBValidKey> {
    const uniq = <T>(value: T, i: number, arr: T[]) => arr.indexOf(value) === i;

    return this.database.db$.pipe(
      concatMap((db) => db.transaction$('albums', 'readwrite')),
      concatMap((transaction) => transaction.objectStore$<Album>('albums')),
      concatMap((store) =>
        store.get$(album.id).pipe(
          map((stored) =>
            stored
              ? {
                  ...stored,
                  artists: [...stored.artists, ...album.artists].filter(uniq),
                  entries: [...stored.entries, ...album.entries].filter(uniq),
                  updatedOn: Math.max(stored.updatedOn, album.updatedOn),
                }
              : album
          ),
          tap((updated) =>
            this.store.dispatch(upsertAlbum({ album: updated }))
          ),
          concatMap((updated) => store.put$(updated))
        )
      )
    );
  }

  getByKey(key: AlbumId): Observable<Album | undefined> {
    return this.store.select(selectAlbumByKey(key));
  }

  getByArtistKey(key: ArtistId): Observable<Album[] | undefined> {
    return this.store
      .select(selectAlbumByAlbumArtistKey(key))
      .pipe(/*map((albums) => albums?.filter((a) => a.albumArtist.id === key))*/);
  }

  getWithArtist(key: ArtistId): Observable<Album[] | undefined> {
    return this.store
      .select(selectAlbumByArtistKey(key))
      .pipe(map((albums) => albums?.filter((a) => a.albumArtist.id !== key)));

    // return this.storage
    //   .walk$<Album>(
    //     'albums',
    //     'artists',
    //     artist.name,
    //     'next',
    //     (album) => album.albumArtist !== artist.name
    //   )
    //   .pipe(map(({ value }) => value));
  }

  getAll(index: AlbumIndex): Observable<Album[]> {
    return this.store.select(selectAlbumIndexAll(index));
  }

  getTotal(): Observable<number> {
    return this.store.select(selectAlbumTotal);
  }

  update(update: IdUpdate<Album>): void {
    this.store.dispatch(updateAlbum({ update }));
  }

  toggleLiked(album: Album): void {
    const update = {
      likedOn: !!album.likedOn ? undefined : new Date().getTime(),
    };
    this.update({ key: album.id, changes: update });
  }
}
