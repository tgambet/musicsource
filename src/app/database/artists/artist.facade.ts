import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Update } from '@creasource/ngrx-idb';
import { Store } from '@ngrx/store';
import { ArtistIndex } from '@app/database/artists/artist.reducer';
import { Artist } from '@app/database/artists/artist.model';
import { updateArtist } from '@app/database/artists/artist.actions';
import {
  selectArtistByKey,
  selectArtistIndexAll,
  selectArtistTotal,
} from '@app/database/artists/artist.selectors';

@Injectable()
export class ArtistFacade {
  constructor(private store: Store) {}

  getByKey(key: string): Observable<Artist | undefined> {
    return this.store.select(selectArtistByKey(key));
  }

  getAll(index: ArtistIndex): Observable<Artist[]> {
    return this.store.select(selectArtistIndexAll(index));
  }

  getTotal(): Observable<number> {
    return this.store.select(selectArtistTotal);
  }

  update(update: Update<Artist>): void {
    this.store.dispatch(updateArtist({ update }));
  }

  toggleLiked(artist: Artist): void {
    const update = { likedOn: !!artist.likedOn ? undefined : new Date() };
    this.update({ key: artist.hash, changes: update });
  }
}
