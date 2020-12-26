import { TestBed } from '@angular/core/testing';

import { AlbumPageResolverService } from './album-page-resolver.service';

describe('AlbumPageResolverService', () => {
  let service: AlbumPageResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlbumPageResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
