import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { QuizService } from 'src/app/services';

/**
 * Summary info of Quiz
 */
export interface QuizSummaryInfo {
  sectionid: number;
  totalcnt: number;
  failedcnt: number;
  timespent: number;
  avgtimespent: number;
}

@Component({
  selector: 'khb-quiz-summary-detail',
  templateUrl: './quiz-summary-detail.component.html',
  styleUrls: ['./quiz-summary-detail.component.scss'],
})
export class QuizSummaryDetailComponent implements OnInit {
  displayedColumns: string[] = ['secid', 'totalcnt', 'failedcnt', 'timespent', 'avgtimespent'];
  data: QuizSummaryInfo[] = [];
  private routerID = -1;
  totalScore = 0;
  totalAvgTime = 0;

  constructor(private activateRoute: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    this.activateRoute.url.subscribe({
      next: (val) => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'display') {
            this.routerID = +val[1].path;
          }
        }

        this.data = [];
        this.totalScore = 0;
        this.totalAvgTime = 0;
        let totalcnt = 0;
        let failedcnt = 0;
        if (this.routerID !== -1) {
          const quiz = this.quizService.ElderQuizs.find((val) => val.QuizID === this.routerID);
          quiz?.ElderSections.forEach((sec) => {
            const summinfo: QuizSummaryInfo = {
              sectionid: sec.SectionID,
              totalcnt: sec.ItemsCount,
              failedcnt: sec.FailedItemsCount,
              timespent: sec.TimeSpent,
              avgtimespent: Math.round(sec.TimeSpent / sec.ItemsCount),
            };
            this.totalAvgTime += sec.TimeSpent;
            totalcnt += sec.ItemsCount;
            failedcnt += sec.FailedItemsCount;
            this.data.push(summinfo);
          });
          if (totalcnt > 0) {
            this.totalScore = Math.round((100 * (totalcnt - failedcnt)) / totalcnt);
            this.totalAvgTime = this.totalAvgTime / totalcnt;
          }
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
