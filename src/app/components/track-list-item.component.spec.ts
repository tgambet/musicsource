import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackListItemComponent } from '@app/components/track-list-item.component';

describe('TrackListComponent', () => {
  let component: TrackListItemComponent;
  let fixture: ComponentFixture<TrackListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TrackListItemComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
