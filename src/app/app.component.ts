/* eslint-disable no-underscore-dangle */
import { ChangeDetectorRef, Component, NgZone, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MediaMatcher } from '@angular/cdk/layout';
import { TranslocoService } from '@ngneat/transloco';
import { DateAdapter } from '@angular/material/core';
import { Title } from '@angular/platform-browser';

import { AppNavItem, AppLanguage, AppNavItemGroupEnum } from './models';
import { ODataService, UIUtilityService } from './services';
import { environment } from 'src/environments/environment';
import { AuthService } from './services/auth.service';

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
    { displayas: 'Languages.zh', value: 'zh' },
  ];
  public selectedLanguage = 'zh';
  get currentUser(): string {
    return this.authService.currentUserName;
  }
  get IsMockData(): boolean {
    return environment.mockdata;
  }

  private _mobileQueryListener: () => void;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private translocoService: TranslocoService,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private dateAdapter: DateAdapter<any>,
    public dialog: MatDialog,
    public oDataSrv: ODataService,
    private zone: NgZone,
    private uiUtilSrv: UIUtilityService,
    private titleService: Title,
    private authService: AuthService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.navItems = [
      {
        name: 'WelcomePage',
        route: '/welcome',
        group: AppNavItemGroupEnum.home,
      },

      {
        name: 'MathExercise.AdditionExercises',
        route: '/primary-school-math/add-ex',
        group: AppNavItemGroupEnum.ps_basic,
      },
      {
        name: 'MathExercise.SubtractionExercises',
        route: '/primary-school-math/sub-ex',
        group: AppNavItemGroupEnum.ps_basic,
      },
      {
        name: 'MathExercise.MultiplicationExercises',
        route: '/primary-school-math/multi-ex',
        group: AppNavItemGroupEnum.ps_basic,
      },
      {
        name: 'MathExercise.DivisionExercises',
        route: '/primary-school-math/div-ex',
        group: AppNavItemGroupEnum.ps_basic,
      },
      {
        name: 'MathExercise.MixedOperations',
        route: '/primary-school-math/mixed-op',
        group: AppNavItemGroupEnum.ps_basic,
      },
      {
        name: 'Quiz.PrintableQuizGenerator',
        route: '/primary-school-math/printable-quiz',
        group: AppNavItemGroupEnum.ps_basic,
      },

      {
        name: 'HighSchool.JuniorHighSchoolMath',
        route: '/high-school/junior-math',
        group: AppNavItemGroupEnum.highschool,
      },
      {
        name: 'HighSchool.SeniorHighSchoolMath',
        route: '/high-school/senior-math',
        group: AppNavItemGroupEnum.highschool,
      },

      {
        name: 'English.Sentences',
        route: '/english-learning/sentences',
        group: AppNavItemGroupEnum.english,
      },

      {
        name: 'PuzzleGames.Calculate24',
        route: '/puzzle-games/cal24',
        group: AppNavItemGroupEnum.games,
      },
      {
        name: 'PuzzleGames.Sudou',
        route: '/puzzle-games/sudou',
        group: AppNavItemGroupEnum.games,
      },
      {
        name: 'PuzzleGames.TypingTutor',
        route: 'puzzle-games/typegame',
        group: AppNavItemGroupEnum.games,
      },
      {
        name: 'PuzzleGames.Gobang',
        route: 'puzzle-games/gobang',
        group: AppNavItemGroupEnum.games,
      },

      {
        name: 'Help.About',
        route: '/help/about',
        group: AppNavItemGroupEnum.help,
      },
      {
        name: 'Help.Credits',
        route: '/help/credits',
        group: AppNavItemGroupEnum.help,
      },  
    ];

    if (!environment.mockdata) {
      this.navItems.push(...[
        {
          name: 'KnowledgeItem',
          route: '/knowledge-item',
          group: AppNavItemGroupEnum.knowledge,
        },
        {
          name: 'ExerciseItem',
          route: '/exercise-item',
          group: AppNavItemGroupEnum.knowledge,
        },
        { name: 'Tags', route: '/tag', group: AppNavItemGroupEnum.knowledge },
        {
          name: 'UserCollections',
          route: '/user-collection',
          group: AppNavItemGroupEnum.knowledge,
        },
        {
          name: 'PracticeHistories',
          route: '/exercise-item/score',
          group: AppNavItemGroupEnum.knowledge,
        },
  
        {
          name: 'PuzzleGames.ChineseChess',
          route: 'puzzle-games/chinesechess',
          group: AppNavItemGroupEnum.games,
        },
        {
          name: 'PuzzleGames.BattleCity',
          route: 'puzzle-games/battlecity',
          group: AppNavItemGroupEnum.games,
        },
  
        // { name: 'Award.Overview', route: '/award', group: AppNavItemGroupEnum.award },
        // { name: 'Award.Rules', route: '/award/rules', group: AppNavItemGroupEnum.award },
        // { name: 'Award.DailyTrace', route: '/award/dailytrace', group: AppNavItemGroupEnum.award },
  
        {
          name: 'Award.Point',
          route: '/habit/points',
          group: AppNavItemGroupEnum.habit,
        },
        {
          name: 'Habit.Habits',
          route: '/habit/list',
          group: AppNavItemGroupEnum.habit,
        },
        {
          name: 'Habit.Records',
          route: '/habit/record',
          group: AppNavItemGroupEnum.habit,
        },
  
      ]);
    }

    this.titleService.setTitle('Knowledge & Habit Builder');
  }

  switchLanguage(lang: string) {
    this.selectedLanguage = lang;
    if (lang === 'en') {
      this.translocoService.setActiveLang('en');
      this.dateAdapter.setLocale('en');
    } else {
      this.translocoService.setActiveLang('zh');
      this.dateAdapter.setLocale('zh');
    }
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }

  openCodeRepo(): void {
    // Open github repo.
    window.open('https://github.com/alvachien/knowledgebuilder', '_blank');
  }
  onOpenHome(): void {
    window.open(environment.homePageUrl, '_blank');
  }
  get versionInfo(): string {
    return environment.version;
  }

  public onLogon(): void {
    this.authService.logon();
  }
  public onLogout(): void {
    this.authService.logout();
  }
  public onUserInfo(): void {
    if (this.authService.userDetail) {
      const dialogRef = this.dialog.open(CurrentUserDialog, {
        width: '600px',
        closeOnNavigation: false,
      });
      dialogRef.afterClosed().subscribe();
    }
  }
}

@Component({
  selector: 'app-current-user-dlg',
  templateUrl: 'app-current-user.dialog.html',
  styleUrls: ['./app-current-user.dialog.scss'],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class CurrentUserDialog {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  displayedColumns: any[] = ['userid', 'username', 'displayas'];

  constructor(public dialogRef: MatDialogRef<CurrentUserDialog>, public authSrv: AuthService) {}
}
