import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerButtonComponent } from './player-button.component';
import { IconComponent } from './icon.component';

describe('PlayerButtonComponent', () => {
  let component: PlayerButtonComponent;
  let fixture: ComponentFixture<PlayerButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerButtonComponent, IconComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
