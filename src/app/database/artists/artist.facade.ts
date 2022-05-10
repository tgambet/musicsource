import { Injectable } from '@angular/core';
import { concatMap, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ArtistIndex } from '@app/database/artists/artist.reducer';
import { Artist, ArtistId } from '@app/database/artists/artist.model';
import {
  addArtist,
  updateArtist,
  upsertArtist,
} from '@app/database/artists/artist.actions';
import {
  selectArtistByKey,
  selectArtistIndexAll,
  selectArtistTotal,
} from '@app/database/artists/artist.selectors';
import { IdUpdate } from '@app/core/utils';
import { DatabaseService } from '@app/database/database.service';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ArtistFacade {
  constructor(private store: Store, private database: DatabaseService) {}

  add(artist: Artist): Observable<IDBValidKey> {
    return this.database
      .add$<Artist>('artists', artist)
      .pipe(tap(() => this.store.dispatch(addArtist({ artist }))));
  }

  put(artist: Artist): Observable<IDBValidKey> {
    const uniq = <T>(value: T, i: number, arr: T[]) => arr.indexOf(value) === i;

    return this.database.db$.pipe(
      concatMap((db) => db.transaction$('artists', 'readwrite')),
      concatMap((transaction) => transaction.objectStore$<Artist>('artists')),
      concatMap((store) =>
        store.get$(artist.id).pipe(
          map((stored) =>
            stored
              ? {
                  ...stored,
                  entries: [...stored.entries, ...artist.entries].filter(uniq),
                  updatedOn: Math.max(stored.updatedOn, artist.updatedOn),
                }
              : artist
          ),
          tap((updated) =>
            this.store.dispatch(upsertArtist({ artist: updated }))
          ),
          concatMap((updated) => store.put$(updated))
        )
      )
    );
  }

  getByKey(key: ArtistId): Observable<Artist | undefined> {
    return this.store.select(selectArtistByKey(key));
  }

  getAll(index: ArtistIndex): Observable<Artist[]> {
    return this.store.select(selectArtistIndexAll(index));
  }

  getTotal(): Observable<number> {
    return this.store.select(selectArtistTotal);
  }

  update(update: IdUpdate<Artist>): void {
    this.store.dispatch(updateArtist({ update }));
  }

  toggleLiked(artist: Artist): void {
    const update = {
      likedOn: !!artist.likedOn ? undefined : new Date().getTime(),
    };
    this.update({ key: artist.id, changes: update });
  }
}
