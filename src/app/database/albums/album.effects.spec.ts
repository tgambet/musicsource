import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { AlbumEffects } from './album.effects';

describe('AlbumEffects', () => {
  let actions$: Observable<any>;
  let effects: AlbumEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AlbumEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(AlbumEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
