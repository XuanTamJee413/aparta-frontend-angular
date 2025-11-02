import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MeterRecordingSheetComponent } from './meter-recording-sheet.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('MeterRecordingSheetComponent', () => {
  let component: MeterRecordingSheetComponent;
  let fixture: ComponentFixture<MeterRecordingSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeterRecordingSheetComponent, HttpClientTestingModule, CommonModule, FormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(MeterRecordingSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
