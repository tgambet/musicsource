import { ActionReducer, createReducer, on } from '@ngrx/store';
import { initialState, PlayerState } from '@app/store/player/player.state';
import {
  setCurrentIndex,
  setDuration,
  setNextIndex,
  setNextSong,
  setPlaying,
  setPlaylist,
  setPrevIndex,
  show,
} from '@app/store/player/player.actions';

export const playerReducer: ActionReducer<PlayerState> = createReducer(
  initialState,
  on(show, (state) => ({
    ...state,
    show: true,
  })),
  on(setPlaylist, (state, { playlist, currentIndex }) => ({
    ...state,
    playlist,
    currentIndex,
  })),
  on(setNextSong, (state, { song }) => {
    const index = state.currentIndex || 0;
    const playlist = state.playlist.splice(index, 0, song);
    return {
      ...state,
      playlist,
    };
  }),
  on(setCurrentIndex, (state, { index }) => ({
    ...state,
    currentIndex: Math.min(state.playlist.length - 1, index),
  })),
  on(setNextIndex, (state) => ({
    ...state,
    currentIndex: Math.min(
      state.playlist.length - 1,
      (state.currentIndex || 0) + 1
    ),
  })),
  on(setPrevIndex, (state) => ({
    ...state,
    currentIndex: Math.max(0, (state.currentIndex || 0) - 1),
  })),
  on(setPlaying, (state, { playing }) => ({
    ...state,
    playing,
  })),
  on(setDuration, (state, { duration }) => ({
    ...state,
    duration,
  }))
);
