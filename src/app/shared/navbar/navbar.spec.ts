import { MediaMatcher } from '@angular/cdk/layout';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MatDialogModule,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER } from '@jsverse/transloco';
import { of, BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

import { UserAuthInfo } from '../../interfaces';
import { AuthService, UserCodeService } from '../../services';
import { NavigationFocusService } from '../navigation-focus/navigation-focus.service';

import { NavbarComponent, UserInfoDialogComponent } from './navbar';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let mockUserCodeService: { getUserCode: ReturnType<typeof vi.fn>; setUserCode: ReturnType<typeof vi.fn> };
  let mockNavigationFocusService: { getSkipLinkHref: ReturnType<typeof vi.fn> };
  let mockMediaMatches: { current: boolean };
  let authContentSubject: BehaviorSubject<UserAuthInfo>;

  beforeEach(async () => {
    mockDialog = { open: vi.fn() };
    mockUserCodeService = { getUserCode: vi.fn(), setUserCode: vi.fn() };
    mockNavigationFocusService = { getSkipLinkHref: vi.fn() };
    mockMediaMatches = { current: false };
    const mockTranslocoService = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn(),
      selectTranslate: vi.fn().mockReturnValue(of('')),
      _loadDependencies: vi.fn().mockReturnValue(of(null)),
      translate: vi.fn().mockReturnValue(''),
      activeLang: 'en',
      config: { reRenderOnLangChange: true, prodMode: false },
      langChanges$: of('en'),
      events$: of(),
    };

    mockNavigationFocusService.getSkipLinkHref.mockReturnValue('/test-link');

    authContentSubject = new BehaviorSubject(new UserAuthInfo());

    await TestBed.configureTestingModule({
      imports: [
        NavbarComponent,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatTooltipModule,
        MatDividerModule,
        RouterTestingModule,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialog, useValue: mockDialog },
        { provide: UserCodeService, useValue: mockUserCodeService },
        {
          provide: AuthService,
          useValue: {
            authContent: authContentSubject.asObservable(),
            doLogin: vi.fn(),
            doLogout: vi.fn(),
            clearError: vi.fn(),
          },
        },
        { provide: NavigationFocusService, useValue: mockNavigationFocusService },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        {
          provide: MediaMatcher,
          useValue: {
            matchMedia: vi.fn().mockReturnValue({
              get matches() { return mockMediaMatches.current; },
              addEventListener: vi.fn(),
              removeEventListener: vi.fn(),
              addListener: vi.fn(),
              removeListener: vi.fn(),
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set homeUrl from environment', () => {
      expect(component.homeUrl).toBeDefined();
    });

    it('should call getSkipLinkHref after timeout', async () => {
      fixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 150));
      expect(mockNavigationFocusService.getSkipLinkHref).toHaveBeenCalled();
      expect(component.skipLinkHref).toBe('/test-link');
    });

    it('should initialize skipLinkHidden to true', () => {
      expect(component.skipLinkHidden).toBe(true);
    });
  });

  describe('OnPush change detection', () => {
    it('should mark the view for check after the skipLinkHref timeout fires', async () => {
      // Regression: skipLinkHref is set inside a setTimeout(100). With
      // ChangeDetectionStrategy.OnPush the bound href would not reach the
      // template without markForCheck.
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 150));

      expect(component.skipLinkHref).toBe('/test-link');
      expect(markForCheckSpy).toHaveBeenCalled();
    });

    it('should mark the view for check when auth state arrives (no click needed)', () => {
      // Regression: auth state lands in an async subscribe callback. With
      // ChangeDetectionStrategy.OnPush the login button / user name / error
      // banner would stay stale until a later DOM event.
      const markForCheckSpy = vi.spyOn(component['cdr'], 'markForCheck');
      markForCheckSpy.mockClear();

      authContentSubject.next(new UserAuthInfo());

      expect(markForCheckSpy).toHaveBeenCalled();
    });
  });

  describe('onSetUser', () => {
    it('should open UserInfoDialogComponent dialog with current user code', () => {
      const testUserCode = 'USER456';
      mockUserCodeService.getUserCode.mockReturnValue(testUserCode);

      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)), close: vi.fn() };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onSetUser();

      expect(mockDialog.open).toHaveBeenCalledWith(UserInfoDialogComponent, {
        data: { usercode: testUserCode },
        width: '500px',
        height: '250px',
        enterAnimationDuration: 800,
        exitAnimationDuration: 500,
      });
    });

    it('should open dialog with empty string when no user code exists', () => {
      mockUserCodeService.getUserCode.mockReturnValue('');

      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)), close: vi.fn() };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onSetUser();

      expect(mockDialog.open).toHaveBeenCalledWith(
        UserInfoDialogComponent,
        expect.objectContaining({
          data: { usercode: '' },
        })
      );
    });

    it('should call getUserCode from service', () => {
      mockUserCodeService.getUserCode.mockReturnValue('TEST123');

      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)), close: vi.fn() };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onSetUser();

      expect(mockUserCodeService.getUserCode).toHaveBeenCalled();
    });

    it('should configure dialog with correct animation durations', () => {
      mockUserCodeService.getUserCode.mockReturnValue('');

      const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(undefined)), close: vi.fn() };
      mockDialog.open.mockReturnValue(mockDialogRef);

      component.onSetUser();

      expect(mockDialog.open).toHaveBeenCalledWith(
        UserInfoDialogComponent,
        expect.objectContaining({
          enterAnimationDuration: 800,
          exitAnimationDuration: 500,
        })
      );
    });
  });

  describe('onUserDetail', () => {
    it('should navigate to /user-detail', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.onUserDetail();

      expect(navigateSpy).toHaveBeenCalledWith(['/user-detail']);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptions', () => {
      vi.spyOn((component as any).subscriptions, 'unsubscribe');

      component.ngOnDestroy();

      expect(component['subscriptions'].unsubscribe).toHaveBeenCalled();
    });

    it('should remove media query listener', () => {
      const removeEventListenerSpy = vi.spyOn(component['mobileQuery'], 'removeEventListener');

      component.ngOnDestroy();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', component['mobileQueryListener']);
    });

    it('should not throw error when called multiple times', () => {
      expect(() => {
        component.ngOnDestroy();
        component.ngOnDestroy();
      }).not.toThrow();
    });
  });

  describe('drawer', () => {
    it('should initialize drawerOpened to false', () => {
      expect(component.drawerOpened).toBe(false);
    });

    it('should initialize isSmallScreen from media query', () => {
      expect(component.isSmallScreen).toBe(false);
    });

    it('should toggle drawer state on toggleDrawer', () => {
      expect(component.drawerOpened).toBe(false);

      component.toggleDrawer();
      expect(component.drawerOpened).toBe(true);

      component.toggleDrawer();
      expect(component.drawerOpened).toBe(false);
    });

    it('should close drawer on closeDrawer', () => {
      component.drawerOpened = true;

      component.closeDrawer();
      expect(component.drawerOpened).toBe(false);
    });

    it('should close drawer when screen becomes large', () => {
      component.drawerOpened = true;
      component.isSmallScreen = true;

      // Simulate screen resize to large
      const listener = component['mobileQueryListener'];
      mockMediaMatches.current = false;
      listener();

      expect(component.isSmallScreen).toBe(false);
      expect(component.drawerOpened).toBe(false);
    });
  });

  describe('template interactions', () => {
    it('should render component template', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });
  });
});

describe('UserInfoDialogComponent', () => {
  let component: UserInfoDialogComponent;
  let fixture: ComponentFixture<UserInfoDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockUserCodeService: { getUserCode: ReturnType<typeof vi.fn>; setUserCode: ReturnType<typeof vi.fn> };

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
    mockDialogRef = { close: vi.fn() };
    mockUserCodeService = { getUserCode: vi.fn(), setUserCode: vi.fn() };
    const mockTranslocoService = createMockTranslocoService();

    await TestBed.configureTestingModule({
      imports: [
        UserInfoDialogComponent,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        FormsModule,
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        NoopAnimationsModule,
        TranslocoModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: UserCodeService, useValue: mockUserCodeService },
        { provide: MAT_DIALOG_DATA, useValue: { usercode: 'INITIAL123' } },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('constructor', () => {
    it('should set usercode from data when provided', () => {
      expect(component.usercode()).toBe('INITIAL123');
    });

    it('should set empty string when usercode is not in data', async () => {
      TestBed.resetTestingModule();
      const mockTranslocoService = createMockTranslocoService();

      await TestBed.configureTestingModule({
        imports: [
          UserInfoDialogComponent,
          MatDialogModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          FormsModule,
          MatDialogTitle,
          MatDialogContent,
          MatDialogActions,
          NoopAnimationsModule,
          TranslocoModule,
        ],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: UserCodeService, useValue: mockUserCodeService },
          { provide: MAT_DIALOG_DATA, useValue: { usercode: null } },
          { provide: TranslocoService, useValue: mockTranslocoService },
          { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(UserInfoDialogComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.usercode()).toBe('');
    });

    it('should handle empty string in data', async () => {
      TestBed.resetTestingModule();
      const mockTranslocoService = createMockTranslocoService();

      await TestBed.configureTestingModule({
        imports: [
          UserInfoDialogComponent,
          MatDialogModule,
          MatFormFieldModule,
          MatInputModule,
          MatButtonModule,
          FormsModule,
          MatDialogTitle,
          MatDialogContent,
          MatDialogActions,
          NoopAnimationsModule,
          TranslocoModule,
        ],
        providers: [
          { provide: MatDialogRef, useValue: mockDialogRef },
          { provide: UserCodeService, useValue: mockUserCodeService },
          { provide: MAT_DIALOG_DATA, useValue: { usercode: '' } },
          { provide: TranslocoService, useValue: mockTranslocoService },
          { provide: TRANSLOCO_TRANSPILER, useValue: {} },
        ],
      }).compileComponents();

      const newFixture = TestBed.createComponent(UserInfoDialogComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.usercode()).toBe('');
    });
  });

  describe('onYesClick', () => {
    it('should call setUserCode with current usercode value', () => {
      component.usercode.set('SAVE123');

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith('SAVE123');
    });

    it('should close dialog after saving', () => {
      component.usercode.set('SAVE456');

      component.onYesClick();

      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should save empty string if usercode is empty', () => {
      component.usercode.set('');

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith('');
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle whitespace-only user code', () => {
      const whitespaceCode = '   ';
      component.usercode.set(whitespaceCode);

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith(whitespaceCode);
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle special characters in user code', () => {
      const specialCode = 'USER@123#$%';
      component.usercode.set(specialCode);

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith(specialCode);
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should call setUserCode before closing dialog', () => {
      component.usercode.set('ORDER_TEST');

      let setUserCodeCalled = false;
      let closeCalled = false;

      mockUserCodeService.setUserCode.mockImplementation(() => {
        setUserCodeCalled = true;
        expect(closeCalled).toBe(false);
      });

      mockDialogRef.close.mockImplementation(() => {
        closeCalled = true;
        expect(setUserCodeCalled).toBe(true);
      });

      component.onYesClick();

      expect(setUserCodeCalled).toBe(true);
      expect(closeCalled).toBe(true);
    });
  });

  describe('onNoClick', () => {
    it('should close dialog without saving', () => {
      component.usercode.set('UNCHANGED');

      component.onNoClick();

      expect(mockUserCodeService.setUserCode).not.toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should not pass any data when closing', () => {
      component.usercode.set('WILL_NOT_SAVE');

      component.onNoClick();

      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should work even if usercode is modified', () => {
      component.usercode.set('ORIGINAL');
      component.usercode.set('MODIFIED');

      component.onNoClick();

      expect(mockUserCodeService.setUserCode).not.toHaveBeenCalled();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });
  });

  describe('template interactions', () => {
    it('should render dialog content', () => {
      const compiled = fixture.nativeElement;
      expect(compiled).toBeTruthy();
    });

    it('should have form field', () => {
      const formField = fixture.nativeElement.querySelector('mat-form-field');
      expect(formField).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle very long user code', () => {
      const longCode = 'A'.repeat(1000);
      component.usercode.set(longCode);

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith(longCode);
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle unicode characters in user code', () => {
      const unicodeCode = '用户123😀';
      component.usercode.set(unicodeCode);

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith(unicodeCode);
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle numeric user code', () => {
      const numericCode = '1234567890';
      component.usercode.set(numericCode);

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith(numericCode);
    });

    it('should handle code with newlines', () => {
      const codeWithNewlines = 'line1\nline2\nline3';
      component.usercode.set(codeWithNewlines);

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith(codeWithNewlines);
    });

    it('should handle code with tabs', () => {
      const codeWithTabs = 'column1\tcolumn2\tcolumn3';
      component.usercode.set(codeWithTabs);

      component.onYesClick();

      expect(mockUserCodeService.setUserCode).toHaveBeenCalledWith(codeWithTabs);
    });
  });

  describe('model signal behavior', () => {
    it('should allow reading usercode value', () => {
      expect(component.usercode()).toBe('INITIAL123');
    });

    it('should allow setting usercode value', () => {
      component.usercode.set('NEW_VALUE');
      expect(component.usercode()).toBe('NEW_VALUE');
    });

    it('should allow multiple updates', () => {
      component.usercode.set('VALUE1');
      expect(component.usercode()).toBe('VALUE1');

      component.usercode.set('VALUE2');
      expect(component.usercode()).toBe('VALUE2');

      component.usercode.set('VALUE3');
      expect(component.usercode()).toBe('VALUE3');
    });
  });
});
