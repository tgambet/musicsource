import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelComponent } from './label.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('LabelComponent', () => {
  let component: LabelComponent;
  let fixture: ComponentFixture<LabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [LabelComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have top and bottom labels', () => {
    component.topLabel = 'TopLabel';
    component.bottomLabel = 'BottomLabel';
    fixture.detectChanges();
    const elem = fixture.nativeElement;
    expect(elem.querySelector('p.top').textContent).toContain('TopLabel');
    expect(elem.querySelector('p.bottom').textContent).toContain('BottomLabel');
  });

  it('should have a top link', () => {
    component.topLabel = { text: 'TopLabel', routerLink: ['/dest'] };
    component.bottomLabel = 'BottomLabel';
    fixture.detectChanges();
    const elem = fixture.nativeElement;
    expect(elem.querySelector('p.top a').textContent).not.toBeNull();
    expect(elem.querySelector('p.top a').href).toContain('dest');
  });

  it('should allow of array of texts/links as bottom label', () => {
    component.topLabel = { text: 'TopLabel', routerLink: ['/dest'] };
    component.bottomLabel = [
      { text: 'text1', routerLink: ['/dest1'] },
      { text: 'text2', routerLink: ['/dest2'] },
      'text3',
    ];
    fixture.detectChanges();
    const elem = fixture.nativeElement;
    expect(elem.querySelectorAll('p.bottom a')).toHaveSize(2);
    expect(elem.querySelectorAll('p.bottom a')[0].href).toContain('dest1');
    expect(elem.querySelectorAll('p.bottom a')[1].href).toContain('dest2');
    expect(elem.querySelectorAll('span.separator')).toHaveSize(2);
    expect(
      elem.querySelector('p.bottom span:not(.separator)').textContent
    ).toContain('text3');
  });
});
