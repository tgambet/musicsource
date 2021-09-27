import { TestBed } from '@angular/core/testing';

import { PagePlaylistResolver } from './page-playlist-resolver.service';

describe('PlaylistPageResolverService', () => {
  let service: PagePlaylistResolver;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PagePlaylistResolver);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
