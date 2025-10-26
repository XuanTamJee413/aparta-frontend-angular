import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SubscriptionFormModalComponent } from './subscription-form-modal.component';

describe('SubscriptionFormModalComponent', () => {
  let component: SubscriptionFormModalComponent;
  let fixture: ComponentFixture<SubscriptionFormModalComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<SubscriptionFormModalComponent>>;

  beforeEach(async () => {
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        SubscriptionFormModalComponent,
        ReactiveFormsModule,
        MatDialogModule,
        MatSnackBarModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'create', subscription: null } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionFormModalComponent);
    component = fixture.componentInstance;
    mockDialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<SubscriptionFormModalComponent>>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values in create mode', () => {
    expect(component.mode).toBe('create');
    expect(component.subscriptionForm.get('projectId')?.value).toBe('');
    expect(component.subscriptionForm.get('numMonths')?.value).toBe(1);
  });

  it('should validate required fields for draft', () => {
    component.onSaveDraft();
    expect(component.subscriptionForm.invalid).toBeTruthy();
  });

  it('should close dialog on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});

