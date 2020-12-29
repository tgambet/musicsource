import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistDialogComponent } from './playlist-dialog.component';

describe('PlaylistDialogComponent', () => {
  let component: PlaylistDialogComponent;
  let fixture: ComponentFixture<PlaylistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlaylistDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
