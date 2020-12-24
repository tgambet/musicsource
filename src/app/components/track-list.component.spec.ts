import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackListComponent } from '@app/components/track-list.component';

describe('TrackListComponent', () => {
  let component: TrackListComponent;
  let fixture: ComponentFixture<TrackListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrackListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
