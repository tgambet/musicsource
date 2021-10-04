import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Album } from '@app/database/albums/album.model';
import {
  selectAlbumIndexAll,
  selectAlbumTotal,
} from '@app/database/albums/album.selectors';
import { Update } from '@creasource/ngrx-idb';
import { updateAlbum } from '@app/database/albums/album.actions';
import { AlbumIndex } from '@app/database/albums/album.reducer';

@Injectable()
export class AlbumFacade {
  constructor(private store: Store) {}

  getAll(index: AlbumIndex): Observable<Album[]> {
    return this.store.select(selectAlbumIndexAll(index));
  }

  getTotal(): Observable<number> {
    return this.store.select(selectAlbumTotal);
  }

  update(update: Update<Album>): void {
    this.store.dispatch(updateAlbum({ update }));
  }
}
