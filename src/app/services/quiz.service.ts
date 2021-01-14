import { Injectable } from '@angular/core';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Observable, throwError, Subject, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ExerciseItem, TagCount, Tag, KnowledgeItem, TagReferenceType, OverviewInfo } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
}
