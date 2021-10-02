import * as fromPicture from './picture.reducer';
import { selectPictureState } from './picture.selectors';

describe('Picture Selectors', () => {
  it('should select the feature state', () => {
    const result = selectPictureState({
      [fromPicture.pictureFeatureKey]: {},
    });

    expect(result).toEqual({});
  });
});
