import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentVisitor } from './recent-visitor';

describe('RecentVisitor', () => {
  let component: RecentVisitor;
  let fixture: ComponentFixture<RecentVisitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentVisitor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentVisitor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
