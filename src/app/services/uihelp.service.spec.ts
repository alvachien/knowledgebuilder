import { TestBed } from '@angular/core/testing';

import { UIHelpService } from './uihelp.service';

describe('UIHelpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UIHelpService = TestBed.get(UIHelpService);
    expect(service).toBeTruthy();
  });
});
