import { TestBed } from '@angular/core/testing';

import { SongFacade } from './song.facade';

describe('SongService', () => {
  let service: SongFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SongFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
