import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SongListItemComponent } from './song-list-item.component';

describe('SongListItemComponent', () => {
  let component: SongListItemComponent;
  let fixture: ComponentFixture<SongListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SongListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SongListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
