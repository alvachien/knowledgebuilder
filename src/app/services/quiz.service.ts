/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, throwError, Subject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { Quiz, QuizItem } from '../models';
import { environment } from '../../environments/environment';
import { DailyAwardRule, RuleType } from '../models/award';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private currentQuizID = 0;
  private elderQuizs: Quiz[] = [];
  private curQuiz?: Quiz;
  private failedItems: QuizItem[] = [];
  private currScore = 0;
  public awardRules: DailyAwardRule[] = [];

  get NextQuizID(): number { return this.currentQuizID + 1; }
  get ActiveQuiz(): Quiz | undefined { return this.curQuiz; }
  get ElderQuizs(): Quiz[] { return this.elderQuizs; }
  get FailedQuizItems(): QuizItem[] { return this.failedItems; }
  set FailedQuizItems(items: QuizItem[]) { this.failedItems = items; }
  get CurrentScore(): number { return this.currScore; }
  set CurrentScore(scre: number) { this.currScore = scre; }

  constructor() {
    let rule = new DailyAwardRule();
    rule.ranges = [{
      taskstart: 18,
      taskend: 21,
      points: [
        { daysFrom: 1, daysTo: 1, point: 1},
        { daysFrom: 2, daysTo: 2, point: 3},
        { daysFrom: 3, daysTo: 3, point: 5},
        { daysFrom: 4, daysTo: 4, point: 8},
        { daysFrom: 5, daysTo: 9999, point: 12},
      ],
    }, {
      taskstart: 21,
      taskend: 22,
      points: [
        { daysFrom: 1, daysTo: 1, point: -1},
        { daysFrom: 2, daysTo: 2, point: -3},
        { daysFrom: 3, daysTo: 3, point: -5},
        { daysFrom: 4, daysTo: 4, point: -8},
        { daysFrom: 5, daysTo: 9999, point: -12},
      ],
    }, {
      taskstart: 22,
      taskend: 23,
      points: [
        { daysFrom: 1, daysTo: 1, point: -5},
        { daysFrom: 2, daysTo: 2, point: -10},
        { daysFrom: 3, daysTo: 3, point: -15},
        { daysFrom: 4, daysTo: 4, point: -20},
        { daysFrom: 5, daysTo: 9999, point: -30},
      ],
    }];
    rule.ruleType = RuleType.goToBedTime;
    this.awardRules.push(rule);

    rule = new DailyAwardRule();
    rule.ranges = [{
      taskstart: 16,
      taskend: 19,
      points: [
        { daysFrom: 1, daysTo: 1, point: 1},
        { daysFrom: 2, daysTo: 2, point: 3},
        { daysFrom: 3, daysTo: 3, point: 5},
        { daysFrom: 4, daysTo: 4, point: 8},
        { daysFrom: 5, daysTo: 9999, point: 12},
      ],
    }, {
      taskstart: 19,
      taskend: 20,
      points: [
        { daysFrom: 1, daysTo: 1, point: -1},
        { daysFrom: 2, daysTo: 2, point: -3},
        { daysFrom: 3, daysTo: 3, point: -5},
        { daysFrom: 4, daysTo: 4, point: -8},
        { daysFrom: 5, daysTo: 9999, point: -12},
      ],
    }, {
      taskstart: 20,
      taskend: 22,
      points: [
        { daysFrom: 1, daysTo: 1, point: -5},
        { daysFrom: 2, daysTo: 2, point: -10},
        { daysFrom: 3, daysTo: 3, point: -15},
        { daysFrom: 4, daysTo: 4, point: -20},
        { daysFrom: 5, daysTo: 9999, point: -30},
      ],
    }];
    rule.ruleType = RuleType.schoolWorkTime;
    this.awardRules.push(rule);
  }
  public startNewQuiz(qid: number): Quiz {
    if (this.curQuiz) {
      throw new Error('Active Quiz not yet completed');
    }

    this.curQuiz = new Quiz(qid);
    this.currentQuizID = qid;

    return this.curQuiz;
  }
  public completeActiveQuiz(): void {
    if (!this.curQuiz) {
      throw new Error('Active Quiz not exist');
    }
    if (this.curQuiz.ActiveSection) {
      throw new Error('Active Quiz has active section');
    }
    this.elderQuizs.push(this.curQuiz);
    this.curQuiz = undefined;
  }
}
