import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { BuildingEditComponent } from './building-edit.component';
import { BuildingService } from '../../../../services/admin/building.service';
import { of } from 'rxjs';

describe('BuildingEditComponent', () => {
  let component: BuildingEditComponent;
  let fixture: ComponentFixture<BuildingEditComponent>;
  let mockBuildingService: jasmine.SpyObj<BuildingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    const buildingServiceSpy = jasmine.createSpyObj('BuildingService', ['getBuildingById', 'updateBuilding']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (key: string) => 'test-building-id'
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        BuildingEditComponent,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatSelectModule
      ],
      providers: [
        { provide: BuildingService, useValue: buildingServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingEditComponent);
    component = fixture.componentInstance;
    mockBuildingService = TestBed.inject(BuildingService) as jasmine.SpyObj<BuildingService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load building data on init', () => {
    const mockBuilding = {
      buildingId: 'test-id',
      projectId: 'PRJ001',
      buildingCode: 'BLD001',
      name: 'Tòa A',
      numApartments: 50,
      numResidents: 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockBuildingService.getBuildingById.and.returnValue(of({
      succeeded: true,
      data: mockBuilding
    }));

    component.ngOnInit();

    expect(mockBuildingService.getBuildingById).toHaveBeenCalledWith('test-building-id');
    expect(component.currentBuilding).toEqual(mockBuilding);
    expect(component.buildingForm.get('name')?.value).toBe('Tòa A');
  });

  it('should validate required fields', () => {
    component.ngOnInit();
    
    // Test empty form
    expect(component.buildingForm.invalid).toBeTruthy();
    
    // Test with required fields
    component.buildingForm.patchValue({
      name: 'Tòa A'
    });
    
    expect(component.buildingForm.valid).toBeTruthy();
  });
});
