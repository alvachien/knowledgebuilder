import { AfterViewInit, Component, EventEmitter, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, of as observableOf } from 'rxjs';
import { catchError, finalize, map, startWith, switchMap } from 'rxjs/operators';

import { UserHabitRecordView } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'khb-habit-record-list',
  templateUrl: './habit-record-list.component.html',
  styleUrls: ['./habit-record-list.component.scss'],
})
export class HabitRecordListComponent implements AfterViewInit {
  arRecords: UserHabitRecordView[] = [];
  displayedColumns: string[] = [
    'targetUser',
    'habitname',
    'recordDate',
    'subID',
    'completeFact',
    'ruleID',
    'contDays',
    'comment',
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

  public getUserDisplayAs(usrId: string): string {
    if (usrId && this.authService.userDetail) {
      const idx = this.authService.userDetail.awardUsers.findIndex((val) => val.targetUser === usrId);
      if (idx !== -1) {
        return this.authService.userDetail.awardUsers[idx].displayAs;
      }
    }
    return '';
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.refreshEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          const top = this.paginator.pageSize;
          const skip = top * this.paginator.pageIndex;
          return this.odataSrv.getUserHabitRecordViews(top, skip, this.sort.active, this.sort.direction);
        }),
        finalize(() => (this.isLoadingResults = false)),
        map((data) => {
          this.recordCount = data.totalCount;

          return data.items;
        }),
        catchError(() => observableOf([]))
      )
      .subscribe({
        next: (data) => (this.arRecords = data as UserHabitRecordView[]),
        error: (err) => this.uiUtilSrv.showSnackInfo(err),
      });
  }

  public onCreateRecord(): void {
    this.uiUtilSrv.navigateHabitRecordCreatePage();
  }
  public onRefreshList(): void {
    this.refreshEvent.emit();
  }
  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }

  public onDisplayRecord(row: UserHabitRecordView): void {
    this.uiUtilSrv.currentUserHabitRecord = row;

    this.uiUtilSrv.navigateHabitRecordDisplayPage();
  }
  public onDeleteRecord(row: UserHabitRecordView): void {
    this.odataSrv.deleteUserHabitRecord(row.habitID ?? 0, row.recordDateString, row.subID).subscribe({
      next: () => {
        this.uiUtilSrv.showSnackInfo('Delete successfully');
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
    });
  }
}
