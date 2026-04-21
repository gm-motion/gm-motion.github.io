import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkProjectComponent } from './work-project.component';

describe('WorkProjectComponent', () => {
  let component: WorkProjectComponent;
  let fixture: ComponentFixture<WorkProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
