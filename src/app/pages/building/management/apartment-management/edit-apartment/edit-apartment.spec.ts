import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditApartment } from './edit-apartment';

describe('EditApartment', () => {
  let component: EditApartment;
  let fixture: ComponentFixture<EditApartment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditApartment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditApartment);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
