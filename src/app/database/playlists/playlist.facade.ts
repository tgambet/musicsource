import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Update } from '@creasource/ngrx-idb';
import { PlaylistIndex } from '@app/database/playlists/playlist.reducer';
import { Playlist } from '@app/database/playlists/playlist.model';
import {
  selectPlaylistIndexAll,
  selectPlaylistTotal,
} from '@app/database/playlists/playlist.selectors';
import { updatePlaylist } from '@app/database/playlists/playlist.actions';

@Injectable()
export class PlaylistFacade {
  constructor(private store: Store) {}

  getAll(index: PlaylistIndex): Observable<Playlist[]> {
    return this.store.select(selectPlaylistIndexAll(index));
  }

  getTotal(): Observable<number> {
    return this.store.select(selectPlaylistTotal);
  }

  update(update: Update<Playlist>): void {
    this.store.dispatch(updatePlaylist({ update }));
  }
}
