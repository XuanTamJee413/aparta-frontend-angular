import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidentProposalComponent } from './proposal.component';

describe('Proposal', () => {
  let component: ResidentProposalComponent;
  let fixture: ComponentFixture<ResidentProposalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResidentProposalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidentProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
