import { AfterViewInit, Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, finalize, map, startWith, switchMap } from 'rxjs/operators';

import { UserHabit, UserHabitRecordView } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-record-list',
  templateUrl: './habit-record-list.component.html',
  styleUrls: ['./habit-record-list.component.scss'],
})
export class HabitRecordListComponent implements OnInit, AfterViewInit {
  arRecords: UserHabitRecordView[] = [];
  displayedColumns: string[] = ['targetUser', 'habitname', 'recordDate', 'subID', 'completeFact', 'ruleID', 'contDays', 'comment'];
  recordCount = 0;
  isLoadingResults = false;
  refreshEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private odataSrv: ODataService,
    public dialog: MatDialog,
    public uiUtilSrv: UIUtilityService) { }

  public getUserDisplayAs(usrId: string): string {
    if (usrId && this.odataSrv.currentUserDetail) {
      const idx = this.odataSrv.currentUserDetail.awardUsers.findIndex(val => val.targetUser === usrId);
      if (idx !== -1) {
        return this.odataSrv.currentUserDetail.awardUsers[idx].displayAs;
      }
    }
    return '';
  }

  ngOnInit(): void {
    this.refreshList();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.refreshEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          const top = this.paginator.pageSize;
          const skip = top * this.paginator.pageIndex;
          return this.odataSrv.getUserHabitRecordViews(top, skip, this.sort.active, this.sort.direction);
        }),
        finalize(() => this.isLoadingResults = false),
        map(data => {
          this.recordCount = data.totalCount;

          return data.items;
        }),
        catchError(() => observableOf([]))
      ).subscribe({
        next: data => this.arRecords = data as UserHabitRecordView[],
        error: err => this.uiUtilSrv.showSnackInfo(err)
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

  public refreshList(): void {
    // this.odataSrv.getUserHabitRecordViews(100, 0).subscribe({
    //   next: val => {
    //     this.arRecords = val.items.slice();
    //     this.recordCount = val.totalCount;
    //   },
    //   error: err => {
    //     this.uiUtilSrv.showSnackInfo(err);
    //   }
    // });
  }

  public onDisplayRecord(row: UserHabitRecordView): void {
    this.uiUtilSrv.currentUserHabitRecord = row;

    this.uiUtilSrv.navigateHabitRecordDisplayPage();
  }
  public onDeleteRecord(row: UserHabitRecordView): void {
    // TBD: delete record.
  }
}

