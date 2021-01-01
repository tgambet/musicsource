import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistAddComponent } from './playlist-add.component';

describe('AddToPlaylistComponent', () => {
  let component: PlaylistAddComponent;
  let fixture: ComponentFixture<PlaylistAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaylistAddComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
