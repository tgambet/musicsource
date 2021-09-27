import { ActionReducer, createReducer } from '@ngrx/store';
import { initialState, LibraryState } from './library.state';

export const libraryReducer: ActionReducer<LibraryState> = createReducer(
  initialState
  // on(addEntry, (state, { entry }) => ({
  //   ...state,
  //   entries: entryAdapter.addOne(entry, state.entries),
  // })),
  // on(addSong, (state, { song }) => ({
  //   ...state,
  //   songs: songAdapter.addOne(song, state.songs),
  // })),
  // on(addPicture, (state, { picture }) => ({
  //   ...state,
  //   pictures: pictureAdapter.addOne(picture, state.pictures),
  // })),
  // on(setEntries, (state, { entries }) => ({
  //   ...state,
  //   entries: entryAdapter.setAll(entries, state.entries),
  // })),
  // on(setSongs, (state, { songs }) => ({
  //   ...state,
  //   songs: songAdapter.setAll(songs, state.songs),
  // })),
  // on(setPictures, (state, { pictures }) => ({
  //   ...state,
  //   pictures: pictureAdapter.setAll(pictures, state.pictures),
  // }))
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
