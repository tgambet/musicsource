import { SongWithCover$ } from '@app/core/song/song.model';

export interface PlayerState {
  show: boolean;
  playlist: SongWithCover$[];
  currentIndex: number;
  playing: boolean;
  loading: boolean;
  duration?: number;
  muted: boolean;
  volume: number;
}

export const initialState: PlayerState = {
  show: false,
  playlist: [],
  currentIndex: 0,
  playing: false,
  loading: false,
  duration: undefined,
  muted: false,
  volume: 1,
};
