import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { Entry } from '@app/utils/entry.util';
import { Song } from '@app/services/extractor.service';

// eslint-disable-next-line no-shadow
export enum ScannerStateEnum {
  idle,
  prompted,
  scanning,
  parsing,
  aborted,
  success,
  error,
}

// export type ArtistState = EntityState<Artist>;
// export type AlbumState = EntityState<Album>;
// export type SongState = EntityState<Song>;
// export type CoverState = EntityState<Cover>;
export type EntryState = EntityState<Entry>;
export type SongState = EntityState<Song>;

// export const artistAdapter: EntityAdapter<Artist> = createEntityAdapter<Artist>(
//   {
//     selectId: (model) => model.id,
//   }
// );
// export const albumAdapter: EntityAdapter<Album> = createEntityAdapter<Album>({
//   selectId: (model) => model.id,
// });
// export const songAdapter: EntityAdapter<Song> = createEntityAdapter<Song>({
//   selectId: (model) => model.id,
// });
// export const coverAdapter: EntityAdapter<Cover> = createEntityAdapter<Cover>({
//   selectId: (model) => model.id,
// });
export const entryAdapter: EntityAdapter<Entry> = createEntityAdapter<Entry>({
  selectId: (model) => model.path,
});

export const songAdapter: EntityAdapter<Song> = createEntityAdapter<Song>({
  selectId: (model) => model.entryPath,
});

export interface LibraryState {
  entries: EntryState;
  songs: SongState;
  // artists: ArtistState;
  // albums: AlbumState;
  // songs: SongState;
  // covers: CoverState;
}

export const initialState: LibraryState = {
  entries: entryAdapter.getInitialState(),
  songs: songAdapter.getInitialState(),
  // artists: artistAdapter.getInitialState(),
  // albums: albumAdapter.getInitialState(),
  // songs: songAdapter.getInitialState(),
  // covers: coverAdapter.getInitialState(),
};
