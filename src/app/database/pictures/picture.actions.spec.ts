import * as fromPicture from './picture.actions';

describe('loadPictures', () => {
  it('should return an action', () => {
    expect(fromPicture.loadPictures().type).toBe('[Picture] Load Pictures');
  });
});
