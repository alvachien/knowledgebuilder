import { TestBed } from '@angular/core/testing';

import { SelectivePreloadingStrategyService } from './selective-preloading-strategy.service';

describe('SelectivePreloadingStrategyService', () => {
  let service: SelectivePreloadingStrategyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectivePreloadingStrategyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
