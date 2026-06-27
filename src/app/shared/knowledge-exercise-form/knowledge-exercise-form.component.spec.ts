import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KnowledgeExerciseFormComponent } from './knowledge-exercise-form.component';

describe('KnowledgeExerciseFormComponent', () => {
  let component: KnowledgeExerciseFormComponent;
  let fixture: ComponentFixture<KnowledgeExerciseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KnowledgeExerciseFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(KnowledgeExerciseFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('printMode', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
