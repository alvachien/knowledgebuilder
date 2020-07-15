import { TestBed } from '@angular/core/testing';

import { ODataService } from './odata.service';

describe('ODataService', () => {
  let service: ODataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ODataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
