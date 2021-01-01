import { TestBed } from '@angular/core/testing';

import { PageArtistResolverService } from './page-artist-resolver.service';

describe('ArtistPageResolverService', () => {
  let service: PageArtistResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageArtistResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
