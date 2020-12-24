import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerPageComponent } from './container-page.component';

describe('ContainerPageComponent', () => {
  let component: ContainerPageComponent;
  let fixture: ComponentFixture<ContainerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContainerPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
