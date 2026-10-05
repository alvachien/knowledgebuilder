import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { vi } from 'vitest';

import { AppComponent } from './app.component';
import { NavigationFocusService } from './shared/navigation-focus/navigation-focus.service';

@Component({
  selector: 'app-navbar',
  template: '<div>Mock Navbar</div>',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
class MockNavbarComponent {}

class MockNavigationFocusService {
  getSkipLinkHref() {
    return '';
  }
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule.withRoutes([])],
      providers: [{ provide: NavigationFocusService, useClass: MockNavigationFocusService }],
    })
      .overrideComponent(AppComponent, {
        set: {
          imports: [MockNavbarComponent, RouterOutlet], // Replace NavBar with mock and add RouterOutlet
        },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'Knowledge Habit Builder' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Knowledge Habit Builder');
  });

  it('should render navbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });

  describe('legacy theme storage cleanup (U11)', () => {
    it('removes the dead kb-theme-storage-current-name key at startup', () => {
      localStorage.setItem('kb-theme-storage-current-name', 'mark-ledger');
      localStorage.setItem('selectedLanguage', 'zh-CN'); // unrelated key must survive

      const fixture = TestBed.createComponent(AppComponent);
      expect(fixture.componentInstance).toBeTruthy();

      expect(localStorage.getItem('kb-theme-storage-current-name')).toBeNull();
      expect(localStorage.getItem('selectedLanguage')).toBe('zh-CN');
      localStorage.removeItem('selectedLanguage');
    });

    it('does not throw when browser storage is disabled', () => {
      const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('storage blocked');
      });
      try {
        expect(() => TestBed.createComponent(AppComponent)).not.toThrow();
      } finally {
        spy.mockRestore();
      }
    });
  });
});
