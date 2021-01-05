import { TestBed } from '@angular/core/testing';

import { PlayerResolverService } from './player-resolver.service';

describe('PlayerResolverService', () => {
  let service: PlayerResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
