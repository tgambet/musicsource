import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryPlaylistsComponent } from './library-playlists.component';

describe('LibraryPlaylistsComponent', () => {
  let component: LibraryPlaylistsComponent;
  let fixture: ComponentFixture<LibraryPlaylistsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibraryPlaylistsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryPlaylistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
