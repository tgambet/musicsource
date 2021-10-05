import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ArtistComponent } from './artist.component';
import { LabelComponent } from './label.component';

describe('ArtistComponent', () => {
  let component: ArtistComponent;
  let fixture: ComponentFixture<ArtistComponent>;
  // let elem: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ArtistComponent, LabelComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistComponent);
    component = fixture.componentInstance;
    // elem = fixture.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('should display the artist cover', () => {
  //   component.cover = 'cover.jpg';
  //   fixture.detectChanges();
  //   expect(elem.querySelector('img').src).toContain('cover.jpg');
  // });
  //
  // it('should display the artist name', () => {
  //   component.name = 'Artist';
  //   component.artistRouterLink = './';
  //   fixture.detectChanges();
  //   expect(elem.querySelector('app-label').textContent).toContain('Artist');
  // });
  //
  // it('should display the legend', () => {
  //   component.legend = '10 songs';
  //   fixture.detectChanges();
  //   expect(elem.querySelector('app-label').textContent).toContain('10 songs');
  // });
  //
  // it('should contain two links', () => {
  //   component.name = 'Artist';
  //   component.artistRouterLink = 'link';
  //   fixture.detectChanges();
  //   expect(elem.querySelectorAll('a')).toHaveSize(2);
  //   elem
  //     .querySelectorAll('a')
  //     .forEach((a: HTMLAnchorElement) => expect(a.href).toContain('link'));
  // });
});
