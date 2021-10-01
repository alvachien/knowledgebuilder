import { TestBed } from '@angular/core/testing';

import { UIUtilityService } from './uiutility.service';

describe('UIUtilityService', () => {
  let service: UIUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UIUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
