import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApartmentList } from './apartment-list';

describe('ApartmentList', () => {
  let component: ApartmentList;
  let fixture: ComponentFixture<ApartmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApartmentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApartmentList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
