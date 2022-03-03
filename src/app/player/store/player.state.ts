import { SongId } from '@app/database/songs/song.model';

export interface PlayerState {
  show: boolean;
  playlist: SongId[];
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
