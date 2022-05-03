import { Injectable } from '@angular/core';
import { concatMap, EMPTY, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ArtistIndex } from '@app/database/artists/artist.reducer';
import { Artist, ArtistId } from '@app/database/artists/artist.model';
import { addArtist, updateArtist } from '@app/database/artists/artist.actions';
import {
  selectArtistByKey,
  selectArtistIndexAll,
  selectArtistTotal,
} from '@app/database/artists/artist.selectors';
import { IdUpdate } from '@app/core/utils';
import { DatabaseService } from '@app/database/database.service';
import { first, tap } from 'rxjs/operators';

@Injectable()
export class ArtistFacade {
  constructor(private store: Store, private database: DatabaseService) {}

  add(artist: Artist): Observable<IDBValidKey> {
    return this.database
      .add$<Artist>('artists', artist)
      .pipe(tap(() => this.store.dispatch(addArtist({ artist }))));
  }

  put(artist: Artist): Observable<IDBValidKey> {
    return this.store.select(selectArtistByKey(artist.id)).pipe(
      first(),
      concatMap((r) =>
        r ? EMPTY : this.database.put$<Artist>('artists', artist)
      ),
      tap(() => this.store.dispatch(addArtist({ artist })))
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
