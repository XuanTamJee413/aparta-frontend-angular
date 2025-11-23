import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookUtilityComponent } from './book-utility.component';

describe('BookUtilityComponent', () => {
  let component: BookUtilityComponent;
  let fixture: ComponentFixture<BookUtilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookUtilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookUtilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
