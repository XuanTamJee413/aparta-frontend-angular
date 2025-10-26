import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FastCheckin } from './fast-checkin';

describe('FastCheckin', () => {
  let component: FastCheckin;
  let fixture: ComponentFixture<FastCheckin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FastCheckin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FastCheckin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
