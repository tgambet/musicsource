import { ActionReducer, createReducer, on } from '@ngrx/store';
import * as Actions from './scanner.actions';
import { initialState, ScannerState } from './scanner.state';

// const format = (value: number) => formatNumber(value, 'en_US');

export const scannerReducer: ActionReducer<ScannerState> = createReducer(
  initialState,

  on(Actions.scanEnd, () => ({ ...initialState })),
  on(Actions.scanEnded, () => ({ ...initialState })),

  // Step 1
  on(Actions.openDirectory, () => ({ ...initialState })),
  on(Actions.openDirectorySuccess, (state) => state),
  on(Actions.openDirectoryFailure, () => ({ ...initialState })),

  // Step 2
  on(Actions.scanEntries, (state) => ({
    ...state,
    state: 'scanning',
  })),
  on(Actions.scanEntry, (state) => ({
    ...state,
    scannedCount: state.scannedCount + 1,
  })),
  on(Actions.scanEntriesSuccess, (state) => ({
    ...state,
    state: 'extracting',
  })),
  on(Actions.scanEntriesFailure, (state, { error }) => ({
    ...state,
    state: 'error',
    label: error?.message || error,
  })),

  // Step 3
  // on(Actions.extractEntries, (state) => ({
  //   ...state,
  //   step: 'Extracting...',
  //   stepSub: 'Loading',
  //   progressDisplay: '-',
  //   progressDisplaySub: `0/${format(state.scannedCount)}`,
  // })),
  on(Actions.extractEntrySuccess, (state, { label }) => ({
    ...state,
    label: label ?? state.label,
    extractedCount: state.extractedCount + 1,
  })),
  on(Actions.extractEntryFailure, (state) => ({
    ...state,
    extractedCount: state.extractedCount + 1,
  }))
  // on(Actions.extractEntriesSuccess, (state, { count }) => ({
  //   ...state,
  //   stepSub: `Extracted ${count} files`,
  //   progress: 100,
  //   progressDisplay: '100%',
  //   progressDisplaySub: `${format(state.extractedCount)}/${format(
  //     state.scannedCount
  //   )}`,
  // })),
  // on(Actions.extractEntriesFailure, (state, { error }) => ({
  //   ...state,
  //   state: 'error',
  //   step: 'Error',
  //   stepSub: error?.message || error,
  //   progress: 100,
  //   progressDisplay: undefined,
  //   progressDisplaySub: undefined,
  // }))

  // Step 4
  // on(Actions.buildAlbums, (state) => ({
  //   ...state,
  //   step: 'Building library...',
  //   stepSub: 'Please wait...',
  // })),
  // on(Actions.buildAlbumSuccess, (state, { album }) => ({
  //   ...state,
  //   stepSub: `${album.artist} - ${album.title}`,
  //   progressDisplay: `${format(state.albumsCount + 1)}`,
  //   progressDisplaySub: state.albumsCount + 1 > 1 ? 'albums' : 'album',
  //   albumsCount: state.albumsCount + 1,
  // })),
  // on(Actions.buildAlbumFailure, (state, { error }) => ({
  //   ...state,
  //   stepSub: error?.message || error,
  // })),
  // on(Actions.buildAlbumsSuccess, (state, { count }) => ({
  //   ...state,
  //   stepSub: `Found ${count} albums`,
  //   progressDisplay: `${format(count)}`,
  //   progressDisplaySub: count > 1 ? 'albums' : 'album',
  // })),
  // on(Actions.buildAlbumsFailure, (state, { error }) => ({
  //   ...state,
  //   state: 'error',
  //   step: 'Error',
  //   stepSub: error?.message || error,
  //   progressDisplay: undefined,
  //   progressDisplaySub: undefined,
  // })),

  // Step 5
  // on(Actions.buildArtists, (state) => ({
  //   ...state,
  //   step: 'Building library...',
  //   stepSub: 'Please wait...',
  // })),
  // on(Actions.buildArtistSuccess, (state, { artist }) => ({
  //   ...state,
  //   stepSub: artist.name,
  //   progressDisplay: `${format(state.artistsCount + 1)}`,
  //   progressDisplaySub: state.artistsCount + 1 > 1 ? 'artists' : 'artist',
  //   artistsCount: state.artistsCount + 1,
  // })),
  // on(Actions.buildArtistFailure, (state, { error }) => ({
  //   ...state,
  //   stepSub: error?.message || error,
  // })),
  // on(Actions.buildArtistsSuccess, (state, { count }) => ({
  //   ...state,
  //   stepSub: `Found ${format(count)} artists`,
  //   progressDisplay: `${format(count)}`,
  //   progressDisplaySub: count > 1 ? 'artists' : 'artist',
  // })),
  // on(Actions.buildArtistsFailure, (state, { error }) => ({
  //   ...state,
  //   state: 'error',
  //   step: 'Error',
  //   stepSub: error?.message || error,
  //   progressDisplay: undefined,
  //   progressDisplaySub: undefined,
  // })),

  // Final
  // on(Actions.scanSuccess, (state) => ({
  //   ...state,
  //   state: 'success',
  //   step: 'Library built',
  //   stepSub:
  //     `${format(state.artistsCount)} ${
  //       state.artistsCount > 1 ? 'artists' : 'artist'
  //     }` +
  //     ' - ' +
  //     `${format(state.albumsCount)} ${
  //       state.albumsCount > 1 ? 'albums' : 'album'
  //     }` +
  //     ' - ' +
  //     `${format(state.songsCount)} ${state.songsCount > 1 ? 'songs' : 'song'}`,
  //   progressDisplay: undefined,
  //   progressDisplaySub: undefined,
  // }))
);
