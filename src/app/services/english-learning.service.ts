import { Injectable } from '@angular/core';
import { EnglishLearningContext, EnglishSentence } from '../models';

@Injectable({
  providedIn: 'root',
})
export class EnglishLearningService {
  private engInstance: EnglishLearningContext = new EnglishLearningContext();
  private sentExercise: EnglishSentence[] = [];

  constructor() {    
  }

  get englishLearningInstance(): EnglishLearningContext {
    return this.engInstance;
  }

  get englishLearningExerciseSentences(): EnglishSentence[] {
    return this.sentExercise;
  }
  
  generateExerciseSentences(num = 10) {
    let setSentence = new Set<string>();
    let sentcnt = this.engInstance.SentenceCount;

    this.sentExercise = [];

    if (sentcnt <= num) {
      for(let i = 0; i < sentcnt; i ++) {
        this.sentExercise.push(this.engInstance.getSentence(i)!);
      }
    } else {
      let nexp = num;

      while(nexp > 0) {
        let nrand = Math.floor(Math.random() * sentcnt);
        if (nrand >= 0 && nrand < sentcnt) {
          let sentobj = this.engInstance.getSentence(nrand)!;
          if (!setSentence.has(sentobj.sentence)) {
            setSentence.add(sentobj.sentence);
            this.sentExercise.push(sentobj);

            nexp --;
          }
        }
      }
    }
  }
}
