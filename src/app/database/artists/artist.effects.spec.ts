import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ArtistEffects } from './artist.effects';

describe('ArtistEffects', () => {
  let actions$: Observable<any>;
  let effects: ArtistEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArtistEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ArtistEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
