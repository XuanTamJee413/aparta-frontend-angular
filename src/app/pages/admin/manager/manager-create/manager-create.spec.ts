import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagerCreateComponent } from './manager-create';


describe('ManagerCreate', () => {
  let component: ManagerCreateComponent;
  let fixture: ComponentFixture<ManagerCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
