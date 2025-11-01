import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceQuotationFormComponent } from './pricequotation-form';

describe('PriceQuotationFormComponent', () => {
  let component: PriceQuotationFormComponent;
  let fixture: ComponentFixture<PriceQuotationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceQuotationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceQuotationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});