import { createFeatureSelector, createSelector } from '@ngrx/store';
import { entryAdapter, LibraryState, songAdapter } from './library.state';
import {
  DirectoryEntry,
  Entry,
  isChild,
  isDirectChild,
  isDirectory,
} from '@app/utils/entry.util';

export const selectLibraryState = createFeatureSelector<LibraryState>(
  'library'
);

export const selectEntries = createSelector(selectLibraryState, (state) =>
  entryAdapter.getSelectors().selectAll(state.entries)
);

export const selectRootFolders = createSelector(
  selectEntries,
  (entries) =>
    entries.filter(
      (entry) => entry.kind === 'directory' && entry.parent === undefined
    ) as DirectoryEntry[]
);

export const selectChildrenEntries = createSelector(
  selectEntries,
  (entries: Entry[], folder: DirectoryEntry) =>
    entries.filter((entry) => isChild(folder, entry))
);

export const selectDirectChildrenEntries = createSelector(
  selectEntries,
  (entries: Entry[], folder: DirectoryEntry) =>
    entries.filter((entry) => isDirectChild(folder, entry))
);

const findAsyncSequential = async <T>(
  array: T[],
  predicate: (t: T) => Promise<boolean>
): Promise<T | undefined> => {
  for (const t of array) {
    if (await predicate(t)) {
      return t;
    }
  }
  return undefined;
};

export const findDirectory = createSelector(
  selectEntries,
  (entries: Entry[], directory: DirectoryEntry) =>
    findAsyncSequential(entries.filter(isDirectory), (entry) =>
      entry.handle.isSameEntry(directory.handle)
    )
);

export const selectSongs = createSelector(selectLibraryState, (state) =>
  songAdapter.getSelectors().selectAll(state.songs)
);

//
// export const selectAlbums = createSelector(selectLibraryState, (state) =>
//   albumAdapter.getSelectors().selectAll(state.albums)
// );
//
// export const selectArtists = createSelector(selectLibraryState, (state) =>
//   artistAdapter.getSelectors().selectAll(state.artists)
// );
//
// export const selectAlbumsOfArtist = createSelector(
//   selectLibraryState,
//   (state: LibraryState, artist: string) =>
//     albumAdapter
//       .getSelectors()
//       .selectAll(state.albums)
//       .filter((album) => album.artist === artist)
// );
//
// export const selectArtistById = createSelector(
//   selectLibraryState,
//   (state: LibraryState, id: string) =>
//     artistAdapter.getSelectors().selectEntities(state.artists)[id]
// );
//
// export const selectAlbumById = createSelector(
//   selectLibraryState,
//   (state: LibraryState, id: string) =>
//     albumAdapter.getSelectors().selectEntities(state.albums)[id]
// );
//
// export const selectSongsByAlbumId = createSelector(
//   selectLibraryState,
//   (state: LibraryState, id: string) =>
//     songAdapter
//       .getSelectors()
//       .selectAll(state.songs)
//       .filter((song) => song.albumId === id)
// );
//
// export const selectCoverById = createSelector(
//   selectLibraryState,
//   (state: LibraryState, id: string) =>
//     coverAdapter.getSelectors().selectEntities(state.covers)[id]
// );
