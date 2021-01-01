import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistLikesComponent } from './playlist-likes.component';

describe('PlaylistLikesComponent', () => {
  let component: PlaylistLikesComponent;
  let fixture: ComponentFixture<PlaylistLikesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistLikesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistLikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
