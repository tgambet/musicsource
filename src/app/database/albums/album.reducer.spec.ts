import { albumReducer, initialState } from './album.reducer';

describe('Album Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = albumReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
