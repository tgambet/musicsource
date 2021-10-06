import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Update } from '@creasource/ngrx-idb';
import { PlaylistIndex } from '@app/database/playlists/playlist.reducer';
import { Playlist } from '@app/database/playlists/playlist.model';
import {
  selectPlaylistAll,
  selectPlaylistsByIndexKey,
  selectPlaylistByKey,
  selectPlaylistIndexAll,
  selectPlaylistTotal,
} from '@app/database/playlists/playlist.selectors';
import {
  createPlaylist,
  updatePlaylist,
} from '@app/database/playlists/playlist.actions';
import { Song } from '@app/database/songs/song.model';

@Injectable()
export class PlaylistFacade {
  constructor(private store: Store) {}

  getByKey(key: string): Observable<Playlist | undefined> {
    return this.store.select(selectPlaylistByKey(key));
  }

  getByIndexKey(key: string, index: PlaylistIndex): Observable<Playlist[]> {
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

  update(update: Update<Playlist>): void {
    this.store.dispatch(updatePlaylist({ update }));
  }

  create(playlist: Playlist): void {
    this.store.dispatch(createPlaylist({ playlist }));
  }

  addSongsTo(playlist: Playlist, songs: Song[]): void {
    const changes = {
      songs: [...songs.map((s) => s.entryPath), ...playlist.songs],
    };
    this.update({ key: playlist.hash, changes });
  }

  toggleLiked(playlist: Playlist): void {
    const changes = {
      likedOn: !!playlist.likedOn ? undefined : new Date(),
    };
    this.update({ key: playlist.hash, changes });
  }
}
