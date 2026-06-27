import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../../environments/environment';

/**
 * Service responsible for setting the title that appears above the components and guide pages.
 */
@Injectable({ providedIn: 'root' })
export class AppPageTitle {
  private bodyTitle = inject(Title);
  _title = '';
  _originalTitle = environment.pageTitle;

  get title(): string {
    return this._title;
  }

  set title(title: string) {
    this._title = title;
    if (title !== '') {
      title = `${title} | ${this._originalTitle}`;
    } else {
      title = this._originalTitle;
    }
    this.bodyTitle.setTitle(title);
  }
}
