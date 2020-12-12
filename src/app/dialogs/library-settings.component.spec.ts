import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrarySettingsComponent } from './library-settings.component';

describe('LibrarySettingsComponent', () => {
  let component: LibrarySettingsComponent;
  let fixture: ComponentFixture<LibrarySettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibrarySettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibrarySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
