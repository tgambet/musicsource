import { pictureReducer, initialState } from './picture.reducer';

describe('Picture Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = pictureReducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });
});
