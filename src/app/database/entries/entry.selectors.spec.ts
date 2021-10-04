import * as fromEntry from './entry.reducer';
import { selectEntryState } from './entry.selectors';

describe('Entry Selectors', () => {
  it('should select the feature state', () => {
    const result: any = selectEntryState({
      [fromEntry.entryFeatureKey]: {},
    });

    expect(result).toEqual({});
  });
});
