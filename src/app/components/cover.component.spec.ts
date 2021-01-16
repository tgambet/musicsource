import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverComponent } from './cover.component';
import { MenuComponent } from './menu.component';
import { PlayerButtonComponent } from './player-button.component';
import { IconComponent } from './icon.component';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';

describe('CoverComponent', () => {
  let component: CoverComponent;
  let fixture: ComponentFixture<CoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatMenuModule, RouterTestingModule],
      declarations: [
        CoverComponent,
        MenuComponent,
        PlayerButtonComponent,
        IconComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverComponent);
    component = fixture.componentInstance;
    // component.playerState = 'stopped';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
