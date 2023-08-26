import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleComponent } from './title.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('TitleComponent', () => {
  let component: TitleComponent;
  let fixture: ComponentFixture<TitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [TitleComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TitleComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    // component.title = 'Title';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(
      'Title',
    );
  });

  it('should have an optional head', () => {
    // component.title = 'Title';
    component.head = 'Head';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('p').textContent).toContain(
      'Head',
    );
  });

  it('should not display any link by default', () => {
    // component.title = 'Title';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('should display a link if specified', () => {
    // component.title = 'Title';
    component.titleRouterLink = 'destination';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('a')).toHaveSize(1);
    expect(fixture.nativeElement.querySelector('a')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a').href).toContain(
      'destination',
    );
  });

  it('should display an additional link if specified', () => {
    // component.title = 'Title';
    component.titleRouterLink = 'destination';
    component.extraLinkLabel = 'more content';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('a')).toHaveSize(2);
    fixture.nativeElement
      .querySelectorAll('a')
      .forEach((a: HTMLAnchorElement) =>
        expect(a.href).toContain('destination'),
      );
  });

  it('should not display an avatar by default', () => {
    // component.title = 'Title';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
  });

  it('should display an avatar if specified', () => {
    // component.title = 'Title';
    component.avatarSrc = '/assets/avatar.jpg';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('img').src).toContain(
      '/assets/avatar.jpg',
    );
  });
});
