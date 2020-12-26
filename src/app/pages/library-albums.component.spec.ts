import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryAlbumsComponent } from './library-albums.component';

describe('LibraryAlbumsComponent', () => {
  let component: LibraryAlbumsComponent;
  let fixture: ComponentFixture<LibraryAlbumsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibraryAlbumsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryAlbumsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
