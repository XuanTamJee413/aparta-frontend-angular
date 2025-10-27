import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SubscriptionListComponent } from './subscription-list.component';

describe('SubscriptionListComponent', () => {
  let component: SubscriptionListComponent;
  let fixture: ComponentFixture<SubscriptionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SubscriptionListComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load subscriptions on init', () => {
    spyOn(component, 'loadSubscriptions');
    component.ngOnInit();
    expect(component.loadSubscriptions).toHaveBeenCalled();
  });

  it('should switch tabs correctly', () => {
    component.onTabChange(1);
    expect(component.currentTab).toBe('draft');
    
    component.onTabChange(0);
    expect(component.currentTab).toBe('main');
  });

  it('should apply filter', () => {
    spyOn(component, 'loadSubscriptions');
    component.applyFilter();
    expect(component.currentPage).toBe(1);
    expect(component.loadSubscriptions).toHaveBeenCalled();
  });

  it('should clear filter', () => {
    component.selectedStatus = 'Active';
    component.createdAtStart = new Date();
    component.clearFilter();
    
    expect(component.selectedStatus).toBe('');
    expect(component.createdAtStart).toBeNull();
  });
});
