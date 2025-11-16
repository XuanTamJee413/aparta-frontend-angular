import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateContract } from './create-contract';

describe('CreateContract', () => {
  let component: CreateContract;
  let fixture: ComponentFixture<CreateContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateContract]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateContract);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
