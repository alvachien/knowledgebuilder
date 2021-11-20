/* eslint-disable no-underscore-dangle */
import { ChangeDetectorRef, Component, Inject, NgZone, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MediaMatcher } from '@angular/cdk/layout';
import { TranslocoService } from '@ngneat/transloco';
import { DateAdapter } from '@angular/material/core';

import { AppNavItem, AppLanguage, AppNavItemGroupEnum, UserAuthInfo } from './models';
import { AuthService, ODataService, UIUtilityService } from './services';
import { environment } from 'src/environments/environment';

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
  public selectedLanguage = 'zh';

  private _mobileQueryListener: () => void;

  constructor(changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private translocoService: TranslocoService,
    private dateAdapter: DateAdapter<any>,
    public dialog: MatDialog,
    public oDataSrv: ODataService,
    private authSrv: AuthService,
    private zone: NgZone,
    private uiUtilSrv: UIUtilityService,
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
      { name: 'MathExercise.MixedOperations', route: '/primary-school-math/mixed-op', group: AppNavItemGroupEnum.ps_basic },
      { name: 'Quiz.PrintableQuizGenerator', route: '/primary-school-math/printable-quiz', group: AppNavItemGroupEnum.ps_basic },

      { name: 'KnowledgeItem', route: '/knowledge-item', group: AppNavItemGroupEnum.knowledge },
      { name: 'ExerciseItem', route: '/exercise-item', group: AppNavItemGroupEnum.knowledge },
      { name: 'Tags', route: '/tag', group: AppNavItemGroupEnum.knowledge },
      { name: 'UserCollections', route: '/user-collection', group: AppNavItemGroupEnum.knowledge },
      { name: 'PracticeHistories', route: '/exercise-item/score', group: AppNavItemGroupEnum.knowledge },

      { name: 'PuzzleGames.Calculate24', route: '/puzzle-games/cal24', group: AppNavItemGroupEnum.games },
      { name: 'PuzzleGames.Sudou', route: '/puzzle-games/sudou', group: AppNavItemGroupEnum.games },
      { name: 'PuzzleGames.TypingTutor', route: 'puzzle-games/typegame', group: AppNavItemGroupEnum.games },
      { name: 'PuzzleGames.Gobang', route: 'puzzle-games/gobang', group: AppNavItemGroupEnum.games },

      { name: 'Award.Overview', route: '/award', group: AppNavItemGroupEnum.award },
      { name: 'Award.Rules', route: '/award/rules', group: AppNavItemGroupEnum.award },
      { name: 'Award.DailyTrace', route: '/award/dailytrace', group: AppNavItemGroupEnum.award },

      { name: 'Habit.Habits', route: '/habit/list', group: AppNavItemGroupEnum.habit },
      { name: 'Habit.Records', route: '/habit/record', group: AppNavItemGroupEnum.habit },

      { name: 'Help.About', route: '/help/about', group: AppNavItemGroupEnum.help },
      { name: 'Help.Credits', route: '/help/credits', group: AppNavItemGroupEnum.help },
    ];

    this.authSrv.authContent.subscribe((x: UserAuthInfo) => {
      this.zone.run(() => {
        if (x && x.isAuthorized) {
          this.oDataSrv.currentUser = x;
          // Get user detail automatically.
          this.oDataSrv.getUserDetail().subscribe();
        }
      });
    });
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
  get versionInfo(): string {
    return environment.version;
  }

  public onUserInfo(): void {
    if (this.oDataSrv.isLoggedin) {
      this.oDataSrv.getUserDetail().subscribe({
        next: val => {
          const dialogRef = this.dialog.open(CurrentUserDialog, {
            width: '600px',
            closeOnNavigation: false
          });
          dialogRef.afterClosed().subscribe();
        },
        error: err => {
          this.uiUtilSrv.showSnackInfo(err);
        }
      });
    } else {
      this.authSrv.doLogin();
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
  displayedColumns: any[] = ['userid', 'username', 'displayas'];

  constructor(public dialogRef: MatDialogRef<CurrentUserDialog>,
    public oDataSrv: ODataService) {}
}
