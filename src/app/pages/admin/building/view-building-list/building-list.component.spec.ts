import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { BuildingListComponent } from './building-list.component';
import { BuildingService } from '../../../../services/admin/building.service';

describe('BuildingListComponent', () => {
  let component: BuildingListComponent;
  let fixture: ComponentFixture<BuildingListComponent>;
  let buildingService: jasmine.SpyObj<BuildingService>;

  beforeEach(async () => {
    const buildingServiceSpy = jasmine.createSpyObj('BuildingService', ['getAllBuildings', 'deleteBuilding']);

    await TestBed.configureTestingModule({
      imports: [
        BuildingListComponent,
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: BuildingService, useValue: buildingServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingListComponent);
    component = fixture.componentInstance;
    buildingService = TestBed.inject(BuildingService) as jasmine.SpyObj<BuildingService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load buildings on init', () => {
    const mockResponse = {
      succeeded: true,
      message: 'Success',
      data: {
        items: [],
        totalCount: 0
      }
    };

    buildingService.getAllBuildings.and.returnValue({
      subscribe: (callback: any) => callback.next(mockResponse)
    } as any);

    component.ngOnInit();

    expect(buildingService.getAllBuildings).toHaveBeenCalled();
  });

  it('should handle search', () => {
    component.searchTerm = 'test';
    component.currentPage = 2;
    
    spyOn(component, 'loadBuildings');
    component.searchBuildings();

    expect(component.currentPage).toBe(1);
    expect(component.loadBuildings).toHaveBeenCalled();
  });

  it('should clear search', () => {
    component.searchTerm = 'test';
    component.currentPage = 2;
    
    spyOn(component, 'loadBuildings');
    component.clearSearch();

    expect(component.searchTerm).toBe('');
    expect(component.currentPage).toBe(1);
    expect(component.loadBuildings).toHaveBeenCalled();
  });

  it('should calculate page numbers correctly', () => {
    component.totalPages = 10;
    component.currentPage = 5;
    
    const pages = component.getPageNumbers();
    
    expect(pages).toEqual([3, 4, 5, 6, 7]);
  });

  it('should handle page size change', () => {
    component.currentPage = 3;
    
    spyOn(component, 'loadBuildings');
    component.onPageSizeChange();

    expect(component.currentPage).toBe(1);
    expect(component.loadBuildings).toHaveBeenCalled();
  });

  it('should go to page within valid range', () => {
    component.totalPages = 5;
    component.currentPage = 2;
    
    spyOn(component, 'loadBuildings');
    component.goToPage(3);

    expect(component.currentPage).toBe(3);
    expect(component.loadBuildings).toHaveBeenCalled();
  });

  it('should not go to page outside valid range', () => {
    component.totalPages = 5;
    component.currentPage = 2;
    
    spyOn(component, 'loadBuildings');
    component.goToPage(0);
    component.goToPage(6);

    expect(component.currentPage).toBe(2);
    expect(component.loadBuildings).not.toHaveBeenCalled();
  });
});
