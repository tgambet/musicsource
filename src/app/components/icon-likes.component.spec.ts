import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconLikesComponent } from './icon-likes.component';

describe('IconLikesComponent', () => {
  let component: IconLikesComponent;
  let fixture: ComponentFixture<IconLikesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IconLikesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IconLikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
