import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { BuildingCreateComponent } from './building-create.component';
import { BuildingService } from '../../../../services/admin/building.service';
import { of } from 'rxjs';

describe('BuildingCreateComponent', () => {
  let component: BuildingCreateComponent;
  let fixture: ComponentFixture<BuildingCreateComponent>;
  let mockBuildingService: jasmine.SpyObj<BuildingService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const buildingServiceSpy = jasmine.createSpyObj('BuildingService', ['createBuilding']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        BuildingCreateComponent,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule
      ],
      providers: [
        { provide: BuildingService, useValue: buildingServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingCreateComponent);
    component = fixture.componentInstance;
    mockBuildingService = TestBed.inject(BuildingService) as jasmine.SpyObj<BuildingService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();
    expect(component.buildingForm.get('projectId')?.value).toBe('');
    expect(component.buildingForm.get('buildingCode')?.value).toBe('');
    expect(component.buildingForm.get('name')?.value).toBe('');
    expect(component.buildingForm.get('numApartments')?.value).toBe(null);
    expect(component.buildingForm.get('numResidents')?.value).toBe(null);
  });

  it('should validate required fields', () => {
    component.ngOnInit();
    
    // Test empty form
    expect(component.buildingForm.invalid).toBeTruthy();
    
    // Test with required fields
    component.buildingForm.patchValue({
      projectId: 'PRJ001',
      buildingCode: 'BLD001',
      name: 'Tòa A'
    });
    
    expect(component.buildingForm.valid).toBeTruthy();
  });
});
