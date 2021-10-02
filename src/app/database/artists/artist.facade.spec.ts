import { TestBed } from '@angular/core/testing';

import { ArtistFacade } from './artist.facade';

describe('ArtistService', () => {
  let service: ArtistFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtistFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
