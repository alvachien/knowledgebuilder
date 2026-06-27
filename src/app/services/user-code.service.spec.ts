import { TestBed } from '@angular/core/testing';

import { UserCodeService } from './user-code.service';

describe('UserCodeService', () => {
  let service: UserCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have isUserCodeEntered as false initially', () => {
      expect(service.isUserCodeEntered).toBe(false);
    });

    it('should return empty string for user code initially', () => {
      expect(service.getUserCode()).toBe('');
    });
  });

  describe('setUserCode', () => {
    it('should set the user code and update isUserCodeEntered', () => {
      service.setUserCode('test-code');

      expect(service.isUserCodeEntered).toBe(true);
      expect(service.getUserCode()).toBe('test-code');
    });

    it('should accept different codes', () => {
      service.setUserCode('first-code');
      expect(service.getUserCode()).toBe('first-code');

      service.setUserCode('second-code');
      expect(service.getUserCode()).toBe('second-code');
    });
  });

  describe('getUserCode', () => {
    it('should return the set user code when entered', () => {
      service.setUserCode('my-secret-code');

      expect(service.getUserCode()).toBe('my-secret-code');
    });

    it('should return empty string when no code is entered', () => {
      expect(service.getUserCode()).toBe('');
    });

    it('should return empty string after reset', () => {
      service.setUserCode('test-code');
      // Reset by setting empty code
      service.setUserCode('');

      // Since it's stored, it would still return the empty string
      expect(service.getUserCode()).toBe('');
    });
  });
});
