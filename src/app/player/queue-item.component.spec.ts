import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueueItemComponent } from './queue-item.component';

describe('PlaylistListItemComponent', () => {
  let component: QueueItemComponent;
  let fixture: ComponentFixture<QueueItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QueueItemComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
