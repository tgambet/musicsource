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
import { addAlbum, updateAlbum } from '@app/database/albums/album.actions';
import { AlbumIndex } from '@app/database/albums/album.reducer';
import { first, map, tap } from 'rxjs/operators';
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
    return this.store.select(selectAlbumByKey(album.id)).pipe(
      first(),
      tap((stored) => {
        if (!stored) {
          this.store.dispatch(addAlbum({ album }));
        }
      }),
      concatMap((stored) => {
        if (!stored) {
          return this.database.add$<Album>('albums', album);
        } else {
          const albumN = {
            ...stored,
            artists: [...stored.artists, ...album.artists].filter(
              (value, i, arr) => arr.indexOf(value) === i
            ),
          };
          return this.database.put$<Album>('albums', albumN);
        }
      })
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
