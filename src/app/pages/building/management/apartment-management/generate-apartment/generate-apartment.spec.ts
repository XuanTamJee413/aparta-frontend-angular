import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateApartment } from './generate-apartment';

describe('GenerateApartment', () => {
  let component: GenerateApartment;
  let fixture: ComponentFixture<GenerateApartment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateApartment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateApartment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
