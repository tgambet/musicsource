import { songReducer, initialState } from './song.reducer';

describe('Song Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = songReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
