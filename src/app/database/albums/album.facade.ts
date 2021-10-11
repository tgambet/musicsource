import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Album, AlbumId } from '@app/database/albums/album.model';
import {
  selectAlbumByArtistKey,
  selectAlbumByKey,
  selectAlbumIndexAll,
  selectAlbumTotal,
} from '@app/database/albums/album.selectors';
import { updateAlbum } from '@app/database/albums/album.actions';
import { AlbumIndex } from '@app/database/albums/album.reducer';
import { map } from 'rxjs/operators';
import { IdUpdate } from '@app/core/utils';
import { ArtistId } from '@app/database/artists/artist.model';

@Injectable()
export class AlbumFacade {
  constructor(private store: Store) {}

  getByKey(key: AlbumId): Observable<Album | undefined> {
    return this.store.select(selectAlbumByKey(key));
  }

  getByArtistKey(key: ArtistId): Observable<Album[] | undefined> {
    return this.store
      .select(selectAlbumByArtistKey(key))
      .pipe(map((albums) => albums?.filter((a) => a.artistId === key)));
  }

  getWithArtist(key: ArtistId): Observable<Album[] | undefined> {
    return this.store
      .select(selectAlbumByArtistKey(key))
      .pipe(map((albums) => albums?.filter((a) => a.artistId !== key)));

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
