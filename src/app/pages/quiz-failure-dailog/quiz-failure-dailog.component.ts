import { Component, OnInit } from '@angular/core';

import { QuizService } from 'src/app/services';

@Component({
  selector: 'app-quiz-failure-dailog',
  templateUrl: './quiz-failure-dailog.component.html',
  styleUrls: ['./quiz-failure-dailog.component.scss'],
})
export class QuizFailureDailogComponent implements OnInit {
  displayedColumns = ['qid', 'expected', 'inputted'];
  currentScore = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  failedItems: any[] = [];
  constructor(private quizSrv: QuizService) {}

  ngOnInit(): void {
    this.failedItems = this.quizSrv.FailedQuizItems.slice();
    this.currentScore = this.quizSrv.CurrentScore;
  }
}
