import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { PlaylistIndex } from '@app/database/playlists/playlist.reducer';
import { Playlist, PlaylistId } from '@app/database/playlists/playlist.model';
import {
  selectPlaylistAll,
  selectPlaylistByKey,
  selectPlaylistIndexAll,
  selectPlaylistsByIndexKey,
  selectPlaylistTotal,
} from '@app/database/playlists/playlist.selectors';
import {
  addPlaylist,
  deletePlaylist,
  updatePlaylist,
} from '@app/database/playlists/playlist.actions';
import { Song } from '@app/database/songs/song.model';
import { IdUpdate } from '@app/core/utils';
import { reduceArray } from '@app/core/utils/reduce-array.util';
import { uniq } from '@app/core/utils/uniq.util';

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

  addSongsTo(playlist: Playlist, songs: Song[]): void {
    const changes: Partial<Playlist> = {
      songs: [...songs.map((s) => s.id), ...playlist.songs],
      artists: [
        ...songs
          .map((s) => s.artists.map((a) => a.id))
          .reduce(reduceArray(), []),
        ...playlist.artists,
      ].filter(uniq()),
      albums: [...songs.map((s) => s.album.id), ...playlist.albums].filter(
        uniq()
      ),
    };

    console.log(changes);

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
