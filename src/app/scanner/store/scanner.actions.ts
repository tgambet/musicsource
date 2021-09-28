import { createAction, props } from '@ngrx/store';
import { DirectoryEntry, Entry } from '@app/database/entry.model';
import { Album } from '@app/database/album.model';
import { Artist } from '@app/database/artist.model';
import { Song } from '@app/database/song.model';

export const abortScan = createAction('scanner/abort');
export const scanAborted = createAction('scanner/aborted');

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

// Step 2
export const scanEntries = createAction(
  'scanner/scan/entries',
  props<{ directory: DirectoryEntry }>()
);
export const scanEntrySuccess = createAction(
  'scanner/scan/entry/success',
  props<{ entry: Entry }>()
);
export const scanEntryFailure = createAction(
  'scanner/scan/entry/failure',
  props<{ error: any }>()
);
export const scanEntriesSuccess = createAction(
  'scanner/scan/entries/success',
  props<{ count: number }>()
);
export const scanEntriesFailure = createAction(
  'scanner/scan/entries/failure',
  props<{ error: any }>()
);

// Step 3
export const extractEntries = createAction('scanner/extract/entries');
export const extractEntrySuccess = createAction(
  'scanner/extract/entry/success',
  props<{ song: Song }>()
);
export const extractEntryFailure = createAction(
  'scanner/extract/entry/failure',
  props<{ error: any }>()
);
export const extractEntriesSuccess = createAction(
  'scanner/extract/entries/success',
  props<{ count: number }>()
);
export const extractEntriesFailure = createAction(
  'scanner/extract/entries/failure',
  props<{ error: any }>()
);

// Step 4
export const buildAlbums = createAction('scanner/build/albums');
export const buildAlbumSuccess = createAction(
  'scanner/build/album/success',
  props<{ album: Album }>()
);
export const buildAlbumFailure = createAction(
  'scanner/build/album/failure',
  props<{ error: any }>()
);
export const buildAlbumsSuccess = createAction(
  'scanner/build/albums/success',
  props<{ count: number }>()
);
export const buildAlbumsFailure = createAction(
  'scanner/build/albums/failure',
  props<{ error: any }>()
);

// Step 5
export const buildArtists = createAction('scanner/build/artists');
export const buildArtistSuccess = createAction(
  'scanner/build/artist/success',
  props<{ artist: Artist }>()
);
export const buildArtistFailure = createAction(
  'scanner/build/artist/failure',
  props<{ error: any }>()
);
export const buildArtistsSuccess = createAction(
  'scanner/build/artists/success',
  props<{ count: number }>()
);
export const buildArtistsFailure = createAction(
  'scanner/build/artists/failure',
  props<{ error: any }>()
);

// Final
export const scanSuccess = createAction('scanner/success');
