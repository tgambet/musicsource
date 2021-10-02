import { TestBed } from '@angular/core/testing';

import { PlaylistFacade } from './playlist.facade';

describe('PlaylistService', () => {
  let service: PlaylistFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaylistFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
