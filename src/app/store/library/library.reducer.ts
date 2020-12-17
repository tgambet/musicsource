import { ActionReducer, createReducer, on } from '@ngrx/store';
import {
  initialState,
  entryAdapter,
  LibraryState,
  songAdapter,
} from './library.state';
import {
  parseEntrySucceeded,
  scannedFile,
} from '@app/store/scanner/scanner.actions';

export const libraryReducer: ActionReducer<LibraryState> = createReducer(
  initialState,
  on(scannedFile, (state, { entry }) => ({
    ...state,
    entries: entryAdapter.setOne(entry, state.entries),
  })),
  on(parseEntrySucceeded, (state, { song }) => ({
    ...state,
    songs: songAdapter.setOne(song, state.songs),
  }))
  // on(Actions.addSong, (state, { song }) => ({
  //   ...state,
  //   songs: songAdapter.upsertOne(song, state.songs),
  // })),
  // on(Actions.addAlbum, (state, { album }) => ({
  //   ...state,
  //   albums: albumAdapter.upsertOne(album, state.albums),
  // })),
  // on(Actions.addArtist, (state, { artist }) => ({
  //   ...state,
  //   artists: artistAdapter.upsertOne(artist, state.artists),
  // })),
  // on(Actions.addCover, (state, { cover }) => ({
  //   ...state,
  //   covers: coverAdapter.upsertOne(cover, state.covers),
  // })),
  /*on(Actions.newLibraryEntries, (state, {songs, albums, artists}) => (
    {
      ...state,
      songs: songAdapter.upsertMany(songs, state.songs),
      albums: albumAdapter.upsertMany(albums, state.albums),
      artists: artistAdapter.upsertMany(artists, state.artists)
    }
  )),
  on(Actions.newLibraryEntry, (state, {song, album, artist}) => (
    {
      ...state,
      songs: songAdapter.upsertOne(song, state.songs),
      albums: albumAdapter.upsertOne(album, state.albums),
      artists: artistAdapter.upsertOne(artist, state.artists)
    }
  )),*/
  // on(
  //   Actions.loadLibrarySuccess,
  //   (state, { folders, songs, albums, artists, covers }) => ({
  //     ...state,
  //     folders: folderAdapter.setAll(folders, state.folders),
  //     songs: songAdapter.setAll(songs, state.songs),
  //     albums: albumAdapter.setAll(albums, state.albums),
  //     artists: artistAdapter.setAll(artists, state.artists),
  //     covers: coverAdapter.setAll(covers, state.covers),
  //   })
  // ),
  // on(Actions.updateArtist, (state, { update }) => ({
  //   ...state,
  //   artists: artistAdapter.updateOne(update, state.artists),
  // }))
);
