import { provideLocationMocks } from '@angular/common/testing';
import { Component, NgZone } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';

import { NavigationFocusDirective } from './navigation-focus';
import { NavigationFocusService } from './navigation-focus.service';

describe('Navigation focus service', () => {
  let navigationFocusService: NavigationFocusService;
  let router: Router;
  let zone: NgZone;
  let fixture: ComponentFixture<NavigationFocusTestComponent>;

  const navigate = async (url: string) => {
    await zone.run(() => router.navigateByUrl(url));
    await fixture.whenStable();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NavigationFocusDirective],
      providers: [
        provideRouter([
          { path: '', component: RouteTestComponent },
          { path: 'cdk', component: RouteTestComponent },
          { path: 'guides', component: RouteTestComponent },
        ]),
        provideLocationMocks(),
      ],
    });
    fixture = TestBed.createComponent(NavigationFocusTestComponent);
  });

  beforeEach(() => {
    zone = TestBed.inject(NgZone);
    router = TestBed.inject(Router);
    navigationFocusService = TestBed.inject(NavigationFocusService);
  });

  it('should set skip link href', () => {
    fixture.detectChanges();
    const target1 = fixture.nativeElement.querySelector('#target1');
    const target2 = fixture.nativeElement.querySelector('#target2');

    navigationFocusService.requestSkipLinkFocus(target1);
    navigationFocusService.requestSkipLinkFocus(target2);

    expect(navigationFocusService.getSkipLinkHref()).toEqual('/#target2');

    navigationFocusService.relinquishSkipLinkFocus(target2);

    expect(navigationFocusService.getSkipLinkHref()).toEqual('/#target1');
  });

  it('should set skip link href to null when there are no more requests', () => {
    const target1 = fixture.nativeElement.querySelector('#target1');
    const target3 = fixture.nativeElement.querySelector('.no-id');

    navigationFocusService.requestSkipLinkFocus(target1);
    expect(navigationFocusService.getSkipLinkHref()).toEqual('/#target1');

    navigationFocusService.relinquishSkipLinkFocus(target1);
    // target3 has `focusOnNavigation` directive that automatically requests focus, so focus must
    // be relinquished to test the desired behaviour
    navigationFocusService.relinquishSkipLinkFocus(target3);
    expect(navigationFocusService.getSkipLinkHref()).toBeNull();
  });

  it('should set id for skip link target without id', () => {
    fixture.detectChanges();
    const skipLinkTarget = fixture.nativeElement.querySelector('.no-id');

    // Verify that the directive has set the ID
    expect(skipLinkTarget.id).toMatch(/skip-link-target-[0-9]+/);

    // The directive already calls requestSkipLinkFocus in its constructor,
    // so we should check the href without calling it again
    expect(navigationFocusService.getSkipLinkHref()).toMatch(/\/#skip-link-target-[0-9]+/);
  });

  it('should be within component view', () => {
    const previousUrl = '/components/autocomplete/overview';
    const newUrl = '/components/autocomplete/overview#simple-autocomplete';
    expect(navigationFocusService.isNavigationWithinComponentView(previousUrl, newUrl)).toBe(true);
  });

  it('should not be within component view', () => {
    const previousUrl = '/cdk/clipboard/overview';
    const newUrl = '/cdk/categories';
    expect(navigationFocusService.isNavigationWithinComponentView(previousUrl, newUrl)).toBe(false);
  });

  it('should focus on component then relinquish focus', async () => {
    const target1 = fixture.nativeElement.querySelector('#target1');
    const target2 = fixture.nativeElement.querySelector('#target2');

    // First navigation event doesn't trigger focus because it represents a hardnav.
    navigationFocusService.requestFocusOnNavigation(target1);
    navigationFocusService.requestFocusOnNavigation(target2);
    await navigate('/');
    expect(document.activeElement).not.toEqual(target1);
    expect(document.activeElement).not.toEqual(target2);

    // Most recent requester gets focus on the next nav.
    await navigate('/guides');
    expect(document.activeElement).toEqual(target2);

    // Falls back to the focusing the previous requester once the most recent one relinquishes.
    navigationFocusService.relinquishFocusOnNavigation(target2);
    await navigate('/cdk');
    expect(document.activeElement).toEqual(target1);
  });

  it('should not set focus when navigating to hash target', async () => {
    const target1 = fixture.nativeElement.querySelector('#target1');

    // First navigation event doesn't trigger focus because it represents a hardnav.
    navigationFocusService.requestFocusOnNavigation(target1);
    await navigate('/');
    expect(document.activeElement).not.toEqual(target1);

    // Navigating to a hash target should not set focus on target1 even though it requested focus
    await navigate('/guides#hash');
    expect(document.activeElement).not.toEqual(target1);
  });
});

@Component({
  selector: 'app-navigation-focus-test',
  template: `
    <button id="target1">Target 1</button>
    <button id="target2">Target 2</button>
    <button class="no-id" appFocusOnNavigation>Target 3</button>
  `,
  standalone: true,
  imports: [NavigationFocusDirective],
})
class NavigationFocusTestComponent {}

@Component({
  selector: 'app-route-test',
  template: '',
  standalone: true,
})
class RouteTestComponent {}
