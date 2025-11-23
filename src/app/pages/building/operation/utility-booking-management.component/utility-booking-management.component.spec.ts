import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UtilityBookingManagementComponent } from './utility-booking-management.component';

describe('UtilityBookingManagementComponent', () => {
  let component: UtilityBookingManagementComponent;
  let fixture: ComponentFixture<UtilityBookingManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UtilityBookingManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UtilityBookingManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
