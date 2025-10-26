import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterHousehold } from './register-household';

describe('RegisterHousehold', () => {
  let component: RegisterHousehold;
  let fixture: ComponentFixture<RegisterHousehold>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterHousehold]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterHousehold);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
