import { Component, OnInit, } from '@angular/core';
import { QuizSection } from 'src/app/models';

import { QuizService } from '../../services';

@Component({
  selector: 'app-quiz-summary',
  templateUrl: './quiz-summary.component.html',
  styleUrls: ['./quiz-summary.component.scss'],
})
export class QuizSummaryComponent implements OnInit {
  data: any[] = [];
  displayedColumns: string[] = ['qid', 'count', 'timespent'];
  constructor(private quizSrv: QuizService) {
  }

  ngOnInit(): void {
    this.data = [];
    this.quizSrv.ElderQuizs.forEach(quiz => {
      this.data.push({
        ID: quiz.QuizID,
        Count: quiz.ElderSections.length,
        TimeSpent: quiz.ElderSections.reduce((accumulator, currentValue) => {
          let qsm = new QuizSection(0, 0);
          qsm.TimeSpent = accumulator.TimeSpent + currentValue.TimeSpent; 
          return qsm; 
        }).TimeSpent
      });
    });
  }
}
