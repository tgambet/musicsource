import { TestBed } from '@angular/core/testing';

import { EntryFacade } from './entry.facade';

describe('EntryService', () => {
  let service: EntryFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntryFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
