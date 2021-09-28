import { TestBed } from '@angular/core/testing';

import { MediaSessionService } from './media-session.service';

describe('MediaSessionService', () => {
  let service: MediaSessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaSessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
