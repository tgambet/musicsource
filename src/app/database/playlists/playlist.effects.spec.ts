import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { PlaylistEffects } from './playlist.effects';

describe('PlaylistEffects', () => {
  let actions$: Observable<any>;
  let effects: PlaylistEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PlaylistEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(PlaylistEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
