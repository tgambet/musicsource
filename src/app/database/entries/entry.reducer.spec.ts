import { entryReducer, initialState } from './entry.reducer';

describe('Entry Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = entryReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
