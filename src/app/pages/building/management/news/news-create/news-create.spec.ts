import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsCreate } from './news-create';

describe('NewsCreate', () => {
  let component: NewsCreate;
  let fixture: ComponentFixture<NewsCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
