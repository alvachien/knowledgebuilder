import { TestBed } from '@angular/core/testing';

import { OdataService } from './odata.service';

describe('OdataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OdataService = TestBed.get(OdataService);
    expect(service).toBeTruthy();
  });
});
