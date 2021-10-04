import { artistReducer, initialState } from './artist.reducer';

describe('Artist Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = artistReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
