import { createAction, props } from '@ngrx/store';
import { DirectoryEntry, Entry, FileEntry } from '@app/utils/entry.util';
import { Picture, Song } from '@app/services/extractor.service';

export const openDirectory = createAction('[Scan] Open directory');
export const openDirectoryFailure = createAction(
  'open directory failure',
  props<{ error: any }>()
);
export const scanDirectory = createAction(
  '[Scan] Scan directory',
  props<{ directory: DirectoryEntry }>()
);
export const abortScan = createAction('[Scan] Scan directory abort');
export const scanAborted = createAction('[Scan] Scan Aborted');
export const scannedEntry = createAction(
  '[Scan] Scanned File',
  props<{ entry: Entry }>()
);
export const entrySaved = createAction(
  'scan/entry/saved',
  props<{ entry: Entry }>()
);
export const scanSucceeded = createAction(
  '[Scan] Scan Succeeded',
  props<{ count: number; directory: DirectoryEntry }>()
);
export const scanFailed = createAction(
  '[Scan] Scan Failed',
  props<{ error: any }>()
);
export const parseEntry = createAction(
  '[Scan] Parse entry',
  props<{ entry: FileEntry }>()
);
export const parseEntriesSucceeded = createAction(
  '[Scan] Parse entries succeeded',
  props<{ count: number }>()
);
export const parseEntriesFailed = createAction(
  '[Scan] Parse entries failed',
  props<{ error: any }>()
);
export const parseEntrySucceeded = createAction(
  '[Scan] Parse Entry Succeeded',
  props<{ song: Song; pictures?: Picture[] }>()
);
export const savedSong = createAction(
  'scan/song/saved',
  props<{ song: Song }>()
);
export const parseEntryFailed = createAction(
  '[Scan] Parse Entry Failed',
  props<{ error: any }>()
);
export const saveParsedEntriesSuccess = createAction(
  'scan save songs and pictures',
  props<{ count: number }>()
);
export const saveParsedEntriesFailure = createAction(
  'scan save songs and pictures failure',
  props<{ error: any }>()
);
// export const extractCover = createAction(
//   '[Scan] Extract cover',
//   props<{
//     id: string;
//     picture: { base64: string; format: string } | undefined;
//   }>()
// );
// export const extractCoverFailed = createAction(
//   '[Scan] Extract cover failed',
//   props<{ error: any }>()
// );
