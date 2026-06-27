import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslocoModule, TranslocoService, TRANSLOCO_TRANSPILER } from '@jsverse/transloco';
import { differenceInDays } from 'date-fns';
import { vi } from 'vitest';

import { FooterComponent } from '../../shared/footer/footer';
import { NavigationFocusDirective } from '../../shared/navigation-focus/navigation-focus';
import { AppPageTitle } from '../page-title/page-title';

import { HomepageComponent } from './homepage';

// Stub class for the AppPageTitle service
class MockAppPageTitle {
  _title = '';
  _originalTitle = 'Knowledge Builder';

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
  }
}

describe('HomepageComponent', () => {
  let component: HomepageComponent;
  let fixture: ComponentFixture<HomepageComponent>;

  beforeEach(async () => {
    const mockTranslocoService = {
      setActiveLang: vi.fn(),
      getActiveLang: vi.fn(),
      activeLang: 'en',
    };

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatIconModule,
        NavigationFocusDirective,
        FooterComponent,
        TranslocoModule,
      ],
      providers: [
        { provide: Title, useValue: { setTitle: vi.fn() } },
        { provide: AppPageTitle, useClass: MockAppPageTitle },
        { provide: TranslocoService, useValue: mockTranslocoService },
        { provide: TRANSLOCO_TRANSPILER, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomepageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate daysleft1 correctly', () => {
    const today = new Date();
    const expectedDays = differenceInDays(new Date(2027, 4, 22), today);
    expect(component.daysleft1).toBe(expectedDays);
  });

  it('should calculate daysleft2 correctly', () => {
    const today = new Date();
    const expectedDays = differenceInDays(new Date(2028, 5, 15), today);
    expect(component.daysleft2).toBe(expectedDays);
  });

  it('should calculate daysleft3 correctly', () => {
    const today = new Date();
    const expectedDays = differenceInDays(new Date(2031, 5, 6), today);
    expect(component.daysleft3).toBe(expectedDays);
  });

  it('should set title to empty string on init', () => {
    const appPageTitle = TestBed.inject(AppPageTitle) as MockAppPageTitle;
    expect(appPageTitle.title).toBe(''); // Initially empty

    component.ngOnInit();

    expect(appPageTitle.title).toBe('');
  });

  it('should have correct host bindings', () => {
    expect(component.mainContentClass).toBe(true);
    expect(component.animationsDisabled).toBe(false);
  });
});
