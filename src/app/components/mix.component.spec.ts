import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MixComponent } from './mix.component';
import { CoverComponent } from './cover.component';
import { IconComponent } from './icon.component';
import { LabelComponent } from './label.component';
import { MenuComponent } from './menu.component';
import { MatMenuModule } from '@angular/material/menu';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerButtonComponent } from './player-button.component';

describe('MixComponent', () => {
  let component: MixComponent;
  let fixture: ComponentFixture<MixComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatMenuModule, RouterTestingModule],
      declarations: [
        MixComponent,
        CoverComponent,
        IconComponent,
        LabelComponent,
        MenuComponent,
        PlayerButtonComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
