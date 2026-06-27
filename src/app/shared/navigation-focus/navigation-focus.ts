import type { OnDestroy } from '@angular/core';
import { ElementRef, inject } from '@angular/core';
import { Directive, HostBinding } from '@angular/core';

import { NavigationFocusService } from './navigation-focus.service';

let uid = 0;
@Directive({
  selector: '[appFocusOnNavigation]',
  standalone: true,
})
export class NavigationFocusDirective implements OnDestroy {
  private el = inject(ElementRef);
  private navigationFocusService = inject(NavigationFocusService);

  @HostBinding('tabindex') readonly tabindex = '-1';
  @HostBinding('style.outline') readonly outline = 'none';

  constructor() {
    if (!this.el.nativeElement.id) {
      this.el.nativeElement.id = `skip-link-target-${uid++}`;
    }
    this.navigationFocusService.requestFocusOnNavigation(this.el.nativeElement);
    this.navigationFocusService.requestSkipLinkFocus(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.navigationFocusService.relinquishFocusOnNavigation(this.el.nativeElement);
    this.navigationFocusService.relinquishSkipLinkFocus(this.el.nativeElement);
  }
}
