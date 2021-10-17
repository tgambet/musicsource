import { createAction, props } from '@ngrx/store';
import {
  DirectoryEntry,
  Entry,
  FileEntry,
} from '@app/database/entries/entry.model';

export const scanStart = createAction('scanner/start');
export const scanEnd = createAction('scanner/end');
export const scanEnded = createAction('scanner/ended');

// Step 1
export const openDirectory = createAction('scanner/open');
export const openDirectorySuccess = createAction(
  'scanner/open/success',
  props<{ directory: DirectoryEntry }>()
);
export const openDirectoryFailure = createAction(
  'scanner/open/failure',
  props<{ error: any }>()
);
export const scanEntries = createAction(
  'scanner/scan/entries',
  props<{ directory: DirectoryEntry }>()
);
export const scanEntriesSuccess = createAction(
  'scanner/scan/entries/success',
  props<{ count: number }>()
);
export const scanEntriesFailure = createAction(
  'scanner/scan/entries/failure',
  props<{ error: any }>()
);
export const scanEntry = createAction(
  'scanner/scan/entry',
  props<{ entry: Entry }>()
);
export const extractImageEntry = createAction(
  'scanner/extract/entry/image',
  props<{ entry: FileEntry }>()
);
export const extractMetaEntry = createAction(
  'scanner/extract/entry/meta',
  props<{ entry: FileEntry }>()
);
export const extractSongEntry = createAction(
  'scanner/extract/entry/song',
  props<{ entry: FileEntry }>()
);
export const extractEntrySuccess = createAction(
  'scanner/extract/entry/success',
  props<{ label: string }>()
);
export const extractEntryFailure = createAction(
  'scanner/extract/entry/failure',
  props<{ error: any }>()
);

// export const extractEntriesSuccess = createAction(
//   'scanner/extract/entries/success',
//   props<{ count: number }>()
// );
// export const extractEntriesFailure = createAction(
//   'scanner/extract/entries/failure',
//   props<{ error: any }>()
// );

// Step 4
// export const buildAlbums = createAction('scanner/build/albums');
// export const buildAlbumSuccess = createAction(
//   'scanner/build/album/success',
//   props<{ album: Album }>()
// );
// export const buildAlbumFailure = createAction(
//   'scanner/build/album/failure',
//   props<{ error: any }>()
// );
// export const buildAlbumsSuccess = createAction(
//   'scanner/build/albums/success',
//   props<{ count: number }>()
// );
// export const buildAlbumsFailure = createAction(
//   'scanner/build/albums/failure',
//   props<{ error: any }>()
// );
//
// // Step 5
// export const buildArtists = createAction('scanner/build/artists');
// export const buildArtistSuccess = createAction(
//   'scanner/build/artist/success',
//   props<{ artist: Artist }>()
// );
// export const buildArtistFailure = createAction(
//   'scanner/build/artist/failure',
//   props<{ error: any }>()
// );
// export const buildArtistsSuccess = createAction(
//   'scanner/build/artists/success',
//   props<{ count: number }>()
// );
// export const buildArtistsFailure = createAction(
//   'scanner/build/artists/failure',
//   props<{ error: any }>()
// );

// Final
export const scanSuccess = createAction('scanner/success');
export const scanFailure = createAction(
  'scanner/failure',
  props<{ error: any }>()
);
