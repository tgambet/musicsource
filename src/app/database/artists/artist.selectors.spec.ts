import * as fromArtist from './artist.reducer';
import { selectArtistState } from './artist.selectors';

describe('Artist Selectors', () => {
  it('should select the feature state', () => {
    const result = selectArtistState({
      [fromArtist.artistFeatureKey]: {},
    });

    expect(result).toEqual({});
  });
});
