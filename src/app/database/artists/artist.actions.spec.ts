import * as fromArtist from './artist.actions';

describe('loadArtists', () => {
  it('should return an action', () => {
    expect(fromArtist.loadArtists().type).toBe('[Artist] Load Artists');
  });
});
