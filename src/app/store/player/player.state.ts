import { SongWithCover$ } from '@app/models/song.model';

export interface PlayerState {
  show: boolean;
  playlist: SongWithCover$[];
  currentIndex?: number;
  playing: boolean;
  duration?: number;
}

export const initialState: PlayerState = {
  show: false,
  playlist: [],
  currentIndex: undefined,
  playing: false,
  duration: undefined,
};
