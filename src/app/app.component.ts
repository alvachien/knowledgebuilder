import {ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { TranslocoService } from '@ngneat/transloco';

import { AppNavItem, AppLanguage, AppNavItemGroupEnum } from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  title = 'Knowledge Builder';
  mobileQuery: MediaQueryList;
  public navItems: AppNavItem[] = [];
  public availableLanguages: AppLanguage[] = [
    { displayas: 'Languages.en', value: 'en' },
    { displayas: 'Languages.zh', value: 'zh' }
  ];
  public selectedLanguage: string = 'zh';

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef, 
    media: MediaMatcher,
    private translocoService: TranslocoService,
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.navItems = [
      { name: 'WelcomePage', route: '/welcome', group: AppNavItemGroupEnum.home },
      
      { name: 'MathExercise.AdditionExercises', route: '/primary-school-math/add-ex', group: AppNavItemGroupEnum.ps_basic },
      { name: 'MathExercise.SubtractionExercises', route: '/primary-school-math/sub-ex', group: AppNavItemGroupEnum.ps_basic },
      { name: 'MathExercise.MultiplicationExercises', route: '/primary-school-math/multi-ex', group: AppNavItemGroupEnum.ps_basic },
      { name: 'MathExercise.DivisionExercises', route: '/primary-school-math/div-ex', group: AppNavItemGroupEnum.ps_basic },

      { name: 'KnowledgeItem', route: '/knowledge-item', group: AppNavItemGroupEnum.knowledge },
      { name: 'ExerciseItem', route: '/exercise-item', group: AppNavItemGroupEnum.knowledge },
      { name: 'Tags', route: '/tag', group: AppNavItemGroupEnum.knowledge },

      { name: 'Help.About', route: '/help/about', group: AppNavItemGroupEnum.help },
      { name: 'Help.Credits', route: '/help/credits', group: AppNavItemGroupEnum.help },
    ];
  }

  switchLanguage(lang: string) {
    this.selectedLanguage = lang;
    if (lang === 'en') {
      this.translocoService.setActiveLang('en');
    } else {
      this.translocoService.setActiveLang('zh');      
    }
  }

  toggleFullscreen() {
    // TBD.
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  openCodeRepo(): void {
    // Open github repo.
    window.open('https://github.com/alvachien/knowledgebuilder', '_blank');
  }
}
