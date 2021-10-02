import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { EntryEffects } from './entry.effects';

describe('EntryEffects', () => {
  let actions$: Observable<any>;
  let effects: EntryEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EntryEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(EntryEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
