import { TestBed } from '@angular/core/testing';

import { PictureFacade } from './picture.facade';

describe('PictureService', () => {
  let service: PictureFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PictureFacade);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
