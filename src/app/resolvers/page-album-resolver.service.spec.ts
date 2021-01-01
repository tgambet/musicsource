import { TestBed } from '@angular/core/testing';

import { PageAlbumResolverService } from './page-album-resolver.service';

describe('AlbumPageResolverService', () => {
  let service: PageAlbumResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageAlbumResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
