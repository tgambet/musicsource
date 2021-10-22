import { createAction, props } from '@ngrx/store';
import {
  DirectoryEntry,
  Entry,
  FileEntry,
} from '@app/database/entries/entry.model';
import { Picture } from '@app/database/pictures/picture.model';
import { Artist } from '@app/database/artists/artist.model';
import { Song } from '@app/database/songs/song.model';
import { Album } from '@app/database/albums/album.model';

export const scanStart = createAction('scanner/start');
export const scanEnd = createAction('scanner/end');
export const scanEnded = createAction('scanner/ended');
export const scanSuccess = createAction('scanner/success');
export const scanFailure = createAction(
  'scanner/failure',
  props<{ error: any }>()
);

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
  'scanner/scan-entries',
  props<{ directory: DirectoryEntry }>()
);
export const scanEntriesSuccess = createAction(
  'scanner/scan-entries/success',
  props<{ count: number }>()
);
export const scanEntriesFailure = createAction(
  'scanner/scan-entries/failure',
  props<{ error: any }>()
);

export const extractImageEntry = createAction(
  'scanner/extract/image',
  props<{ entry: FileEntry }>()
);
export const extractMetaEntry = createAction(
  'scanner/extract/meta',
  props<{ entry: FileEntry }>()
);
export const extractSongEntry = createAction(
  'scanner/extract/song',
  props<{ entry: FileEntry }>()
);
export const extractSuccess = createAction(
  'scanner/extract/success',
  props<{ label?: string }>()
);
export const extractFailure = createAction(
  'scanner/extract/failure',
  props<{ error: any }>()
);

export const saveEntry = createAction(
  'scanner/save/entry',
  props<{ entry: Entry }>()
);
export const saveImage = createAction(
  'scanner/save/image',
  props<{ picture: Picture }>()
);
export const saveMeta = createAction('scanner/save/meta');
export const saveArtist = createAction(
  'scanner/save/artist',
  props<{ artist: Artist }>()
);
export const saveAlbum = createAction(
  'scanner/save/album',
  props<{ album: Album }>()
);
export const saveSong = createAction(
  'scanner/save/song',
  props<{ song: Song }>()
);
export const saveSuccess = createAction(
  'scanner/save/success',
  props<{ count: number }>()
);
export const saveFailure = createAction(
  'scanner/save/failure',
  props<{ error: any; count: number }>()
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
