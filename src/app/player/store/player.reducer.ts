import { ActionReducer, createReducer, on } from '@ngrx/store';
import { initialState, PlayerState } from '@app/player/store/player.state';
import {
  addToPlaylist,
  hide,
  setCurrentIndex,
  setDuration,
  setLoading,
  setNextIndex,
  setPlaying,
  setPlaylist,
  setPrevIndex,
  show,
  shuffle,
  toggleMute,
  setVolume,
} from '@app/player/store/player.actions';
import { shuffleArray } from '@app/core/utils/shuffle-array.util';

export const playerReducer: ActionReducer<PlayerState> = createReducer(
  initialState,
  on(show, (state) => ({
    ...state,
    show: true,
  })),
  on(hide, (state) => ({
    ...state,
    show: false,
  })),
  on(setPlaylist, (state, { playlist, currentIndex }) => ({
    ...state,
    playlist,
    currentIndex,
  })),
  on(addToPlaylist, (state, { playlist, next }) => {
    const index = state.currentIndex;
    const newPlaylist = [...state.playlist];
    if (next) {
      newPlaylist.splice(index + 1, 0, ...playlist); // Mutation
    } else {
      newPlaylist.push(...playlist);
    }
    return {
      ...state,
      playlist: newPlaylist,
    };
  }),
  on(setCurrentIndex, (state, { index }) => ({
    ...state,
    currentIndex: Math.min(state.playlist.length - 1, index),
  })),
  on(setNextIndex, (state) => ({
    ...state,
    currentIndex: Math.min(state.playlist.length - 1, state.currentIndex + 1),
  })),
  on(setPrevIndex, (state) => ({
    ...state,
    currentIndex: Math.max(0, state.currentIndex - 1),
  })),
  on(setPlaying, (state, { playing }) => ({
    ...state,
    playing,
  })),
  on(setLoading, (state, { loading }) => ({
    ...state,
    loading,
  })),
  on(setDuration, (state, { duration }) => ({
    ...state,
    duration,
  })),
  on(shuffle, (state) => ({
    ...state,
    playlist: shuffleArray(state.playlist),
  })),
  on(toggleMute, (state) => ({
    ...state,
    muted: !state.muted,
  })),
  on(setVolume, (state, { volume }) => ({
    ...state,
    volume,
  }))
);
