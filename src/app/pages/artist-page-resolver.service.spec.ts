import { TestBed } from '@angular/core/testing';

import { ArtistPageResolverService } from './artist-page-resolver.service';

describe('ArtistPageResolverService', () => {
  let service: ArtistPageResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ArtistPageResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
