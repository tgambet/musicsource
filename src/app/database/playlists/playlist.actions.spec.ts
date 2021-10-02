import * as fromPlaylist from './playlist.actions';

describe('loadPlaylists', () => {
  it('should return an action', () => {
    expect(fromPlaylist.loadPlaylists().type).toBe('[Playlist] Load Playlists');
  });
});
