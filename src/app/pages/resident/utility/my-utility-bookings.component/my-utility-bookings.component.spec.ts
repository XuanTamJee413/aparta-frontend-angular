import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyUtilityBookingsComponent } from './my-utility-bookings.component';

describe('MyUtilityBookingsComponent', () => {
  let component: MyUtilityBookingsComponent;
  let fixture: ComponentFixture<MyUtilityBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyUtilityBookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyUtilityBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
