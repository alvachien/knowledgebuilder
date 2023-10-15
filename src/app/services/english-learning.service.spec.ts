import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { EnglishLearningService } from './english-learning.service';

describe('EnglishLearningService', () => {
    let service: EnglishLearningService;
    let httpTestingController: HttpTestingController;
  
    beforeAll(() => {
        service = new EnglishLearningService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });    
});
