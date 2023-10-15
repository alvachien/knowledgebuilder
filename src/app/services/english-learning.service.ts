import { Injectable } from '@angular/core';
import { EnglishLearningContext } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EnglishLearningService {
  private engInstance: EnglishLearningContext = new EnglishLearningContext();

  constructor() {    
  }

  get englishLearningInstance(): EnglishLearningContext {
    return this.engInstance;
  }
}
