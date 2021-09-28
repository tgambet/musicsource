import { TestBed } from '@angular/core/testing';

import { ScrollerService } from './scroller.service';

describe('ScrollerService', () => {
  let service: ScrollerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
