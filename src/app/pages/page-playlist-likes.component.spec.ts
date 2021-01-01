import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePlaylistLikesComponent } from './page-playlist-likes.component';

describe('PagePlaylistLikesComponent', () => {
  let component: PagePlaylistLikesComponent;
  let fixture: ComponentFixture<PagePlaylistLikesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagePlaylistLikesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagePlaylistLikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
