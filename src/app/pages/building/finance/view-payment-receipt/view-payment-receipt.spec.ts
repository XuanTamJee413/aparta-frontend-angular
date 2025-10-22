import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPaymentReceipt } from './view-payment-receipt';

describe('ViewPaymentReceipt', () => {
  let component: ViewPaymentReceipt;
  let fixture: ComponentFixture<ViewPaymentReceipt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPaymentReceipt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPaymentReceipt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
