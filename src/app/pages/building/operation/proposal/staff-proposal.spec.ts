import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StaffProposalComponent } from './staff-proposal.component';

describe('Proposal', () => {
  let component: StaffProposalComponent;
  let fixture: ComponentFixture<StaffProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaffProposalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaffProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
