import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SongEffects } from './song.effects';

describe('SongEffects', () => {
  let actions$: Observable<any>;
  let effects: SongEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SongEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(SongEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
