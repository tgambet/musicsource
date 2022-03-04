import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryLikesComponent } from './library-likes.component';

describe('LibraryLikesComponent', () => {
  let component: LibraryLikesComponent;
  let fixture: ComponentFixture<LibraryLikesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LibraryLikesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryLikesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
