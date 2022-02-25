import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModulesModule } from '../material-modules';

import { UIUtilityService } from './uiutility.service';

describe('UIUtilityService', () => {
  let service: UIUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MaterialModulesModule,
      ],
    });
    service = TestBed.inject(UIUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
