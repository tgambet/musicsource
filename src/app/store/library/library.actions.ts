import { createAction } from '@ngrx/store';

export const loadEntries = createAction('[Library] Load entries');

// export const addEntry = createAction(
//   '[Library] Add entry',
//   props<{ entry: Entry }>()
// );

// export const addSong = createAction(
//   '[Library] Add song',
//   props<{ song: Song }>()
// );
//
// export const addAlbum = createAction(
//   '[Library] Add album',
//   props<{ album: Album }>()
// );
//
// export const addArtist = createAction(
//   '[Library] Add artist',
//   props<{ artist: Artist }>()
// );
//
// export const addCover = createAction(
//   '[Library] Add cover',
//   props<{ cover: Cover }>()
// );

/*export const newLibraryEntry = createAction(
  '[Library] New song',
  props<{song: Song, album: Album, artist: Artist}>()
);

export const newLibraryEntries = createAction(
  '[Library] New entries',
  props<{songs: Song[], albums: Album[], artists: Artist[]}>()
);*/

// export const loadLibrary = createAction('[Library] Load');
//
// export const loadLibrarySuccess = createAction(
//   '[Library] Load success',
//   props<{
//     folders: DirectoryEntry[];
//     songs: Song[];
//     albums: Album[];
//     artists: Artist[];
//     covers: Cover[];
//   }>()
// );

// export const updateArtist = createAction(
//   '[Library] Update artist',
//   props<{ update: Update<Artist> }>()
// );
