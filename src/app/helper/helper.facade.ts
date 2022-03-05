import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AlbumId } from '@app/database/albums/album.model';
import { addAlbumToQueue, playAlbum } from './helper.actions';

@Injectable()
export class HelperFacade {
  constructor(private store: Store) {}

  playAlbum(albumId: AlbumId, shuffle: boolean = false): void {
    this.store.dispatch(playAlbum({ id: albumId, shuffle }));
  }

  addAlbumToQueue(albumId: AlbumId, next: boolean = false): void {
    this.store.dispatch(addAlbumToQueue({ id: albumId, next }));
  }
}
