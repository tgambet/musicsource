import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ArtistIndex } from '@app/database/artists/artist.reducer';
import { Artist, ArtistId } from '@app/database/artists/artist.model';
import { updateArtist } from '@app/database/artists/artist.actions';
import {
  selectArtistByKey,
  selectArtistIndexAll,
  selectArtistTotal,
} from '@app/database/artists/artist.selectors';
import { IdUpdate } from '@app/core/utils';

@Injectable()
export class ArtistFacade {
  constructor(private store: Store) {}

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
