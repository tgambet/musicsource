import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryContentComponent } from './library-content.component';

describe('LibraryContentComponent', () => {
  let component: LibraryContentComponent;
  let fixture: ComponentFixture<LibraryContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LibraryContentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
