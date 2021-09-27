import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistComponent } from './playlist.component';
import { CoverComponent } from './cover.component';
import { LabelComponent } from './label.component';
import { MenuComponent } from './menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { IconComponent } from './icon.component';
import { PlayerButtonComponent } from './player-button.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('PlaylistComponent', () => {
  let component: PlaylistComponent;
  let fixture: ComponentFixture<PlaylistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatMenuModule, RouterTestingModule],
      declarations: [
        IconComponent,
        PlaylistComponent,
        CoverComponent,
        LabelComponent,
        MenuComponent,
        PlayerButtonComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
