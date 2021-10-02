import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Album } from '@app/database/albums/album.model';
import {
  selectAlbumByHash,
  selectAlbumEntities,
  selectAlbumTotal,
  selectAllAlbums,
  selectAllByIndex,
} from '@app/database/albums/album.selectors';
import { Dictionary } from '@ngrx/entity';
import { Update } from '@creasource/ngrx-idb';
import { updateAlbum } from '@app/database/albums/album.actions';

@Injectable()
export class AlbumFacade {
  constructor(private store: Store) {}

  get(): Observable<Dictionary<Album>> {
    return this.store.select(selectAlbumEntities);
  }

  getAll(index?: string): Observable<{ value: Album; key: string | number }[]> {
    return index
      ? this.store.select(selectAllByIndex(index))
      : this.store.select(selectAllAlbums);
  }

  getTotal(): Observable<number> {
    return this.store.select(selectAlbumTotal);
  }

  getByHash(hash: string): Observable<Album | undefined> {
    return this.store.select(selectAlbumByHash(hash));
  }

  // getYears(): Observable<number[]> {
  //   return this.store.select(selectYears) as Observable<number[]>;
  // }

  update(update: Update<Album>): void {
    this.store.dispatch(updateAlbum({ update }));
  }

  // getByYear(year: number): Observable<any> {
  //   // return this.store
  //   //   .select(selectYearIndex(year))
  //   //   .pipe(
  //   //     switchMap((index) =>
  //   //       this.get().pipe(map((all) => index.map((i) => all[i])))
  //   //     )
  //   //   );
  //   return combineLatest([
  //     this.store.select(selectYearIndex3),
  //     this.database.walk$('albums', 'albumArtist').pipe(
  //       map(({ value }) => value),
  //       toArray()
  //     ),
  //   ]);
  // }
}
