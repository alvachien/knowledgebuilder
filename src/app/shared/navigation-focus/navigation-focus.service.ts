import type { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import type { Event } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, skip } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class NavigationFocusService implements OnDestroy {
  private subscriptions = new Subscription();
  private navigationFocusRequests: HTMLElement[] = [];
  private skipLinkFocusRequests: HTMLElement[] = [];
  private skipLinkHref: string | null | undefined;

  readonly navigationEndEvents = this.router.events.pipe(
    filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
  );
  readonly softNavigations = this.navigationEndEvents.pipe(skip(1));

  constructor(private router: Router) {
    this.subscriptions.add(
      this.softNavigations.subscribe(() => {
        // focus if url does not have fragment
        if (!this.router.url.split('#')[1]) {
          setTimeout(() => {
            if (this.navigationFocusRequests.length) {
              this.navigationFocusRequests[this.navigationFocusRequests.length - 1].focus({
                preventScroll: true,
              });
            }
          }, 100);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  requestFocusOnNavigation(el: HTMLElement) {
    this.navigationFocusRequests.push(el);
  }

  relinquishFocusOnNavigation(el: HTMLElement) {
    const idx = this.navigationFocusRequests.indexOf(el);
    if (idx !== -1) {
      this.navigationFocusRequests.splice(idx, 1);
    }
  }

  requestSkipLinkFocus(el: HTMLElement) {
    this.skipLinkFocusRequests.push(el);
    this.setSkipLinkHref(el);
  }

  relinquishSkipLinkFocus(el: HTMLElement) {
    const idx = this.skipLinkFocusRequests.indexOf(el);
    if (idx !== -1) {
      this.skipLinkFocusRequests.splice(idx, 1);
    }
    const skipLinkFocusTarget = this.skipLinkFocusRequests[this.skipLinkFocusRequests.length - 1];
    this.setSkipLinkHref(skipLinkFocusTarget);
  }

  setSkipLinkHref(el: HTMLElement | null) {
    const baseUrl = this.router.url.split('#')[0];
    this.skipLinkHref = el ? `${baseUrl}#${el.id}` : null;
  }

  getSkipLinkHref(): string | null | undefined {
    return this.skipLinkHref;
  }

  isNavigationWithinComponentView(previousUrl: string, newUrl: string) {
    const componentViewExpression = /(components|cdk)\/([^\/]+)/;

    const previousUrlMatch = previousUrl.match(componentViewExpression);
    const newUrlMatch = newUrl.match(componentViewExpression);

    return (
      previousUrl &&
      newUrl &&
      previousUrlMatch &&
      newUrlMatch &&
      previousUrlMatch[0] === newUrlMatch[0] &&
      previousUrlMatch[1] === newUrlMatch[1]
    );
  }
}
