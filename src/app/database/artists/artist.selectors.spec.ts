import { selectArtistState } from './artist.selectors';
import { artistFeatureKey } from '@app/database/artists/artist.reducer';

describe('Artist Selectors', () => {
  it('should select the feature state', () => {
    const result: any = selectArtistState({
      [artistFeatureKey]: {},
    });

    expect(result).toEqual({});
  });
});
