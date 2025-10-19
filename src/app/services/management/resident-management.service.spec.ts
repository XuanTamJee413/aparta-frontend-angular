/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ResidentManagementService } from './resident-management.service';

describe('Service: ResidentManagement', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResidentManagementService]
    });
  });

  it('should ...', inject([ResidentManagementService], (service: ResidentManagementService) => {
    expect(service).toBeTruthy();
  }));
});
