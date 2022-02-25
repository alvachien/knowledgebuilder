import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ODataService } from './odata.service';

describe('ODataService', () => {
  let service: ODataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
      ],
    });
    service = TestBed.inject(ODataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
