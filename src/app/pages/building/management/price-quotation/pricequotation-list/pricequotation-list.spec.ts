import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceQuotationListComponent } from './pricequotation-list';


describe('PriceQuotationListComponent', () => {
  let component: PriceQuotationListComponent;
  let fixture: ComponentFixture<PriceQuotationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceQuotationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceQuotationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});