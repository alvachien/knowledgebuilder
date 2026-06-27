import type { HttpHandler } from '@angular/common/http';
import { HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '../../environments/environment';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let oidcSpy: { getAccessToken: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    oidcSpy = {
      getAccessToken: vi.fn().mockReturnValue(of('test-bearer-token')),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: OidcSecurityService, useValue: oidcSpy }],
    });
  });

  function runInterceptor(req: HttpRequest<unknown>): HttpRequest<unknown> {
    let capturedReq = req;
    const nextHandler: HttpHandler = {
      handle: (r: HttpRequest<unknown>) => {
        capturedReq = r;
        return of(null as any);
      },
    };

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, nextHandler.handle.bind(nextHandler)).subscribe();
    });

    return capturedReq;
  }

  it('should attach Bearer token to requests targeting apiUrl', () => {
    const req = new HttpRequest('GET', `${environment.apiUrl}/api/TTS/details?sentence=hi`);
    const result = runInterceptor(req);

    expect(result.headers.get('Authorization')).toBe('Bearer test-bearer-token');
  });

  it('should NOT attach Bearer token to requests not targeting apiUrl', () => {
    const req = new HttpRequest('GET', 'https://other-server.com/some-endpoint');
    const result = runInterceptor(req);

    expect(result.headers.has('Authorization')).toBe(false);
  });

  it('should not attach Authorization header if token is empty', () => {
    oidcSpy.getAccessToken.mockReturnValue(of(''));

    const req = new HttpRequest('GET', `${environment.apiUrl}/api/test`);
    const result = runInterceptor(req);

    expect(result.headers.has('Authorization')).toBe(false);
  });
});
