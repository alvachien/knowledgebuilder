import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import moment from 'moment';
import { merge, of as observableOf } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  startWith,
  switchMap,
} from 'rxjs/operators';

import {
  UserHabit,
  getHabitCategoryName,
  HabitCategory,
  getHabitCompleteCategoryName,
  getHabitFrequencyName,
  HabitCompleteCategory,
  HabitFrequency,
  momentDateFormat,
} from 'src/app/models';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss'],
})
export class HabitListComponent implements OnInit, AfterViewInit {
  dataSource: UserHabit[] = [];
  displayedColumns: string[] = [
    'id',
    'targetUser',
    'name',
    'category',
    'frequency',
    'compCategory',
    'validity',
  ];
  recordCount = 0;
  isLoadingResults = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private odataSrv: ODataService,
    public dialog: MatDialog,
    public authService: AuthService,
    public uiUtilSrv: UIUtilityService
  ) {}

  ngOnInit(): void {
    // this.odataSrv.getAwardUserViews().subscribe();

    this.refreshList();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.refreshEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          const top = this.paginator.pageSize;
          const skip = top * this.paginator.pageIndex;
          const todayStr = moment().format(momentDateFormat);
          const filterStr = `ValidFrom le ${todayStr} and ValidTo ge ${todayStr}`;
          return this.odataSrv.getUserHabits(
            top,
            skip,
            this.sort.active,
            this.sort.direction,
            filterStr
          );
        }),
        finalize(() => (this.isLoadingResults = false)),
        map((data) => {
          this.recordCount = data.totalCount;

          return data.items;
        }),
        catchError(() => observableOf([]))
      )
      .subscribe({
        next: (data) => (this.dataSource = data as UserHabit[]),
        error: (err) => this.uiUtilSrv.showSnackInfo(err),
      });
  }

  public getHabitCategoryName(hc: HabitCategory): string {
    return getHabitCategoryName(hc);
  }
  public getHabitCompleteCategoryName(cc: HabitCompleteCategory): string {
    return getHabitCompleteCategoryName(cc);
  }
  public getHabitFrequencyName(frq: HabitFrequency): string {
    return getHabitFrequencyName(frq);
  }
  public getUserDisplayAs(usrId: string): string {
    if (usrId && this.authService.userDetail) {
      const idx = this.authService.userDetail.awardUsers.findIndex(
        (val) => val.targetUser === usrId
      );
      if (idx !== -1) {
        return this.authService.userDetail.awardUsers[idx].displayAs;
      }
    }
    return '';
  }

  public onCreateHabit(): void {
    this.uiUtilSrv.navigateHabitCreatePage();
  }
  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }

  public refreshList(): void {
    this.refreshEvent.emit();
  }

  public onDeleteHabit(hid: number): void {
    this.odataSrv.deleteUserHabit(hid).subscribe({
      next: () => {
        this.refreshList();
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
    });
  }
  public onDisplayHabit(hid: number): void {
    this.uiUtilSrv.navigateHabitDisplayPage(hid);
  }
}
