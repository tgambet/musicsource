import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagePlaylistComponent } from './page-playlist.component';

describe('PlaylistPageComponent', () => {
  let component: PagePlaylistComponent;
  let fixture: ComponentFixture<PagePlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PagePlaylistComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PagePlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
