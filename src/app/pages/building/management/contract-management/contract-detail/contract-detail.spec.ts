import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDetail } from './contract-detail';

describe('ContractDetail', () => {
  let component: ContractDetail;
  let fixture: ComponentFixture<ContractDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
