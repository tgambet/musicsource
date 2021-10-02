import * as fromEntry from './entry.actions';

describe('loadEntries', () => {
  it('should return an action', () => {
    expect(fromEntry.loadEntries().type).toBe('[Entry] Load Entries');
  });
});
