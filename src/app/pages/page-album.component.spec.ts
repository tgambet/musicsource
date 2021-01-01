import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageAlbumComponent } from './page-album.component';

describe('AlbumPageComponent', () => {
  let component: PageAlbumComponent;
  let fixture: ComponentFixture<PageAlbumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageAlbumComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
