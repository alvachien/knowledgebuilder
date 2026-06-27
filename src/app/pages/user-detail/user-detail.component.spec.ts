import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER } from '@jsverse/transloco';
import { BehaviorSubject, of } from 'rxjs';
import { vi } from 'vitest';

import { UserAuthInfo } from '../../interfaces';
import { AuthService } from '../../services';

import { UserDetailComponent } from './user-detail.component';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let mockAuthService: {
    authContent: BehaviorSubject<UserAuthInfo>;
    doLogout: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const createMockTranslocoService = () => ({
    setActiveLang: vi.fn(),
    getActiveLang: vi.fn(),
    selectTranslate: vi.fn().mockReturnValue(of('')),
    _loadDependencies: vi.fn().mockReturnValue(of(null)),
    translate: vi.fn().mockReturnValue(''),
    activeLang: 'en',
    config: { reRenderOnLangChange: true, prodMode: false },
    langChanges$: of('en'),
    events$: of(),
  });

  beforeEach(async () => {
    mockAuthService = {
      authContent: new BehaviorSubject<UserAuthInfo>(
        UserAuthInfo.createAuthenticated({
          userId: 'test-user-id',
          userName: 'Test User',
          accessToken: 'test-token',
        })
      ),
      doLogout: vi.fn(),
    };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [
        UserDetailComponent,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        NoopAnimationsModule,
        RouterTestingModule,
        TranslocoModule,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslocoService, useValue: createMockTranslocoService() },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to authContent and set userId', () => {
      fixture.detectChanges();

      expect(component.userId).toBe('test-user-id');
    });

    it('should subscribe to authContent and set userName', () => {
      fixture.detectChanges();

      expect(component.userName).toBe('Test User');
    });

    it('should update values when authContent changes', () => {
      fixture.detectChanges();
      expect(component.userId).toBe('test-user-id');

      mockAuthService.authContent.next(
        UserAuthInfo.createAuthenticated({
          userId: 'new-user-id',
          userName: 'New User',
          accessToken: 'new-token',
        })
      );

      expect(component.userId).toBe('new-user-id');
      expect(component.userName).toBe('New User');
    });
  });

  describe('onLogout', () => {
    it('should call authService.doLogout()', () => {
      fixture.detectChanges();

      component.onLogout();

      expect(mockAuthService.doLogout).toHaveBeenCalled();
    });

    it('should navigate to home after logout', () => {
      fixture.detectChanges();

      component.onLogout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from authContent subscription', () => {
      fixture.detectChanges();

      const destroySpy = vi.spyOn(component['destroy$'], 'next');
      const completeSpy = vi.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('template', () => {
    it('should display user ID', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const content = compiled.textContent;

      expect(content).toContain('test-user-id');
    });

    it('should display user name', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const content = compiled.textContent;

      expect(content).toContain('Test User');
    });

    it('should have a logout button', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const button = compiled.querySelector('button[color="warn"]');

      expect(button).toBeTruthy();
    });
  });
});
