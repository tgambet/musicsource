import * as fromPlaylist from './playlist.reducer';
import { selectPlaylistState } from './playlist.selectors';

describe('Playlist Selectors', () => {
  it('should select the feature state', () => {
    const result = selectPlaylistState({
      [fromPlaylist.playlistFeatureKey]: {},
    });

    expect(result).toEqual({});
  });
});
