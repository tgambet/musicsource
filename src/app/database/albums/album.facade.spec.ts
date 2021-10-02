import { TestBed } from '@angular/core/testing';

import { AlbumFacade } from './album.facade';

describe('AlbumFacadeService', () => {
  let service: AlbumFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlbumFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
