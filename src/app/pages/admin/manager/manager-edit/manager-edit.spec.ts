import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagerEditComponent } from './manager-edit';

describe('ManagerEditComponent', () => {
  let component: ManagerEditComponent;
  let fixture: ComponentFixture<ManagerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManagerEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

