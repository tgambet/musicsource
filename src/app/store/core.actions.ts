import { createAction, props } from '@ngrx/store';
import { Song } from '@app/models/song.model';
import { Album } from '@app/models/album.model';
import { Artist } from '@app/models/artist.model';

export const saveToDB = createAction(
  '[Core] Save to db',
  props<{ songs: Song[]; albums: Album[]; artists: Artist[] }>()
);

// export const getArtists = createAction('[Core] Get Artists');
//
// export const getArtistsSucceeded = createAction('[Core] Get Artists Success');
//
// export const getArtistsFailed = createAction('[Core] Get Artists Failed');

// export const setSpotifyToken = createAction(
//   '[Core] Spotify token',
//   props<{ token: string; expiresAt: number }>()
// );
//
// export const loadSpotifyToken = createAction('[Core] Load Spotify token');
//
// export const loadSpotifyTokenSuccess = createAction(
//   '[Core] Load Spotify token success',
//   props<{ token: string; expiresAt: number }>()
// );
//
// export const loadSpotifyTokenFailure = createAction(
//   '[Core] Load Spotify token failure',
//   props<{ error: any }>()
// );
