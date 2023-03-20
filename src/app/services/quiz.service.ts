/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';

import { Quiz, QuizItem } from '../models';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private currentQuizID = 0;
  private elderQuizs: Quiz[] = [];
  private curQuiz?: Quiz;
  private failedItems: QuizItem[] = [];
  private currScore = 0;

  get NextQuizID(): number {
    return this.currentQuizID + 1;
  }
  get ActiveQuiz(): Quiz | undefined {
    return this.curQuiz;
  }
  get ElderQuizs(): Quiz[] {
    return this.elderQuizs;
  }
  get FailedQuizItems(): QuizItem[] {
    return this.failedItems;
  }
  set FailedQuizItems(items: QuizItem[]) {
    this.failedItems = items;
  }
  get CurrentScore(): number {
    return this.currScore;
  }
  set CurrentScore(scre: number) {
    this.currScore = scre;
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
