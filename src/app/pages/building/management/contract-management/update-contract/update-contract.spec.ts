import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateContract } from './update-contract';

describe('UpdateContract', () => {
  let component: UpdateContract;
  let fixture: ComponentFixture<UpdateContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateContract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateContract);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
