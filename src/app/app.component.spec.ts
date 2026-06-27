import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { NavigationFocusService } from './shared/navigation-focus/navigation-focus.service';

@Component({
  selector: 'app-navbar',
  template: '<div>Mock Navbar</div>',
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

  it(`should have the 'Knowledge Builder' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Knowledge Builder');
  });

  it('should render navbar', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).toBeTruthy();
  });
});
