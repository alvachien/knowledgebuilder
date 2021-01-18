import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, throwError, Subject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ExerciseItem, TagCount, Tag, KnowledgeItem, TagReferenceType, QuizSection, Quiz } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private currentQuizID: number = 0;
  private elderQuizs: Quiz[] = [];
  private curQuiz?: Quiz;

  get NextQuizID(): number { return this.currentQuizID + 1; }
  get ActiveQuiz(): Quiz | undefined { return this.curQuiz; }
  get ElderQuizs(): Quiz[] { return this.elderQuizs; }

  public startNewQuiz(qid: number): Quiz {
    if (this.curQuiz) {
      throw 'Active Quiz not yet completed';
    }

    this.curQuiz = new Quiz(qid);
    this.currentQuizID = qid;

    return this.curQuiz;
  }
  public completeActiveQuiz(): void {
    if (!this.curQuiz) {
      throw 'Active Quiz not exist';
    }
    if (this.curQuiz.ActiveSection) {
      throw 'Active Quiz has active section';
    }
    this.elderQuizs.push(this.curQuiz);
    this.curQuiz = undefined;
  }  
}
