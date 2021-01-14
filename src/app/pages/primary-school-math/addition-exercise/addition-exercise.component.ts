import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-primary-school-math-addex',
  templateUrl: './addition-exercise.component.html',
  styleUrls: ['./addition-exercise.component.scss'],
})
export class AdditionExerciseComponent implements OnInit, OnDestroy {

  ngOnInit(): void {

  }
  ngOnDestroy(): void {

  }

  canStart(): boolean {
    return false;
  }
  canSubmit(): boolean {
    return false;
  }

  onQuizStart(): void {    
  }

  onQuizSubmit(): void {    
  }
}

