import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Song } from '@app/database/songs/song.model';
import {
  selectSongByKey,
  selectSongByKeys,
} from '@app/database/songs/song.selectors';

@Injectable()
export class SongFacade {
  constructor(private store: Store) {}

  get(key: string): Observable<Song | undefined> {
    return this.store.select(selectSongByKey(key));
  }

  getAllKeys(keys: string[]): Observable<Song[]> {
    return this.store.select(selectSongByKeys(keys));
  }
}
