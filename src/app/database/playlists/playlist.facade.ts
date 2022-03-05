import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlaylistIndex } from '@app/database/playlists/playlist.reducer';
import { Playlist, PlaylistId } from '@app/database/playlists/playlist.model';
import {
  selectPlaylistAll,
  selectPlaylistsByIndexKey,
  selectPlaylistByKey,
  selectPlaylistIndexAll,
  selectPlaylistTotal,
} from '@app/database/playlists/playlist.selectors';
import {
  addPlaylist,
  deletePlaylist,
  updatePlaylist,
} from '@app/database/playlists/playlist.actions';
import { SongId } from '@app/database/songs/song.model';
import { IdUpdate } from '@app/core/utils';

@Injectable()
export class PlaylistFacade {
  constructor(private store: Store) {}

  getByKey(key: PlaylistId): Observable<Playlist | undefined> {
    return this.store.select(selectPlaylistByKey(key));
  }

  getByIndexKey(key: PlaylistId, index: PlaylistIndex): Observable<Playlist[]> {
    return this.store.select(selectPlaylistsByIndexKey(key, index));
  }

  getAll(index?: PlaylistIndex): Observable<Playlist[]> {
    return this.store.select(
      index ? selectPlaylistIndexAll(index) : selectPlaylistAll
    );
  }

  getTotal(): Observable<number> {
    return this.store.select(selectPlaylistTotal);
  }

  update(update: IdUpdate<Playlist>): void {
    this.store.dispatch(updatePlaylist({ update }));
  }

  create(playlist: Playlist): void {
    this.store.dispatch(addPlaylist({ playlist }));
  }

  addSongsTo(playlist: Playlist, songs: SongId[]): void {
    const changes = {
      songs: [...songs, ...playlist.songs],
    };
    this.update({ key: playlist.id, changes });
  }

  toggleLiked(playlist: Playlist): void {
    const changes = {
      likedOn: !!playlist.likedOn ? undefined : new Date().getTime(),
    };
    this.update({ key: playlist.id, changes });
  }

  delete(id: PlaylistId): void {
    this.store.dispatch(deletePlaylist({ id }));
  }
}
