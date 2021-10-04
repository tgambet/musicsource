import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistListItemComponent } from './artist-list-item.component';

describe('ArtistListItemComponent', () => {
  let component: ArtistListItemComponent;
  let fixture: ComponentFixture<ArtistListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArtistListItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
