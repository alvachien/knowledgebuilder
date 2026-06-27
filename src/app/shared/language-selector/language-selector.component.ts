import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TranslocoModule,
  ],
  template: `
    <button
      mat-icon-button
      [matMenuTriggerFor]="menu"
      aria-label="Select language"
      matTooltip="Select language"
      class="app-language-selector-trigger"
    >
      <mat-icon>language</mat-icon>
    </button>
    <mat-menu #menu="matMenu" class="app-language-selector-menu">
      @for (lang of availableLanguages; track lang.code) {
        <button mat-menu-item (click)="switchLanguage(lang.code)">
          <mat-icon
            [color]="currentLanguage === lang.code ? 'accent' : undefined"
            class="app-language-icon"
          >
            {{ currentLanguage === lang.code ? 'radio_button_checked' : 'radio_button_unchecked' }}
          </mat-icon>
          <span>{{ lang.name }}</span>
        </button>
      }
    </mat-menu>
  `,
  styleUrl: './language-selector.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LanguageSelectorComponent implements OnInit {
  private translocoService = inject(TranslocoService);
  private liveAnnouncer = inject(LiveAnnouncer);

  currentLanguage: string = this.translocoService.getActiveLang();
  availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: '中文' },
  ];

  switchLanguage(lang: string) {
    this.translocoService.setActiveLang(lang);
    this.currentLanguage = lang;

    // Save selected language to localStorage
    localStorage.setItem('selectedLanguage', lang);

    // Announce the language change for accessibility
    const selectedLanguage = this.availableLanguages.find(l => l.code === lang)?.name || lang;
    void this.liveAnnouncer.announce(`Language changed to ${selectedLanguage}`, 'polite', 3000);
  }

  ngOnInit() {
    // Load saved language preference
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && this.availableLanguages.some(l => l.code === savedLang)) {
      this.translocoService.setActiveLang(savedLang);
      this.currentLanguage = savedLang;
    }
  }
}
