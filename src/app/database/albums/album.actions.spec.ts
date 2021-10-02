import * as fromAlbum from './album.actions';

describe('loadAlbums', () => {
  it('should return an action', () => {
    expect(fromAlbum.loadAlbums().type).toBe('[Album] Load Albums');
  });
});
