import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetManagement } from './asset-management.service';

describe('AssetManagement', () => {
  let component: AssetManagement;
  let fixture: ComponentFixture<AssetManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
