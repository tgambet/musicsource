import * as fromAlbum from './album.reducer';
import { selectAlbumState } from './album.selectors';

describe('Album Selectors', () => {
  it('should select the feature state', () => {
    const result = selectAlbumState({
      [fromAlbum.albumFeatureKey]: {},
    });

    expect(result).toEqual({});
  });
});
