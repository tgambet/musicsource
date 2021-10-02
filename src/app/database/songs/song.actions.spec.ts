import * as fromSong from './song.actions';

describe('loadSongs', () => {
  it('should return an action', () => {
    expect(fromSong.loadSongs().type).toBe('[Song] Load Songs');
  });
});
