import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistNewComponent } from './playlist-new.component';

describe('PlaylistDialogComponent', () => {
  let component: PlaylistNewComponent;
  let fixture: ComponentFixture<PlaylistNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaylistNewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
