import { playlistReducer, initialState } from './playlist.reducer';

describe('Playlist Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = playlistReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
