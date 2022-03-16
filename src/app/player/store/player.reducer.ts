import { ActionReducer, createReducer, on } from '@ngrx/store';
import { initialState, PlayerState } from '@app/player/store/player.state';
import {
  addToQueue,
  hide,
  setCurrentIndex,
  setDuration,
  setLoading,
  setNextIndex,
  setPlaying,
  setQueue,
  setPrevIndex,
  show,
  toggleMute,
  setVolume,
  setRepeat,
} from '@app/player/store/player.actions';

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
  on(setQueue, (state, { queue, currentIndex }) => ({
    ...state,
    queue,
    currentIndex,
  })),
  on(addToQueue, (state, { queue, next }) => {
    const index = state.currentIndex;
    const newQueue = [...state.queue];
    if (next) {
      newQueue.splice(index + 1, 0, ...queue); // Mutation
    } else {
      newQueue.push(...queue);
    }
    return {
      ...state,
      queue: newQueue,
    };
  }),
  on(setCurrentIndex, (state, { index }) => ({
    ...state,
    currentIndex: Math.min(state.queue.length - 1, index),
  })),
  on(setNextIndex, (state) => ({
    ...state,
    currentIndex: Math.min(state.queue.length - 1, state.currentIndex + 1),
  })),
  on(setPrevIndex, (state) => ({
    ...state,
    currentIndex: Math.max(0, state.currentIndex - 1),
  })),
  on(setPlaying, (state, { playing }) => ({ ...state, playing })),
  on(setLoading, (state, { loading }) => ({ ...state, loading })),
  on(setDuration, (state, { duration }) => ({ ...state, duration })),
  on(toggleMute, (state) => ({ ...state, muted: !state.muted })),
  on(setVolume, (state, { volume }) => ({ ...state, volume })),
  on(setRepeat, (state, { value }) => ({ ...state, repeat: value }))
);
