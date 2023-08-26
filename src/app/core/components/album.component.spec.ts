import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { AlbumComponent } from './album.component';
import { LabelComponent } from './label.component';
import { IconComponent } from './icon.component';
import { MenuComponent } from './menu.component';
import { PlayerButtonComponent } from './player-button.component';
import { CoverComponent } from './cover.component';

describe('AlbumComponent', () => {
  let component: AlbumComponent;
  let fixture: ComponentFixture<AlbumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatMenuModule],
      declarations: [
        AlbumComponent,
        LabelComponent,
        IconComponent,
        MenuComponent,
        PlayerButtonComponent,
        CoverComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AlbumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
