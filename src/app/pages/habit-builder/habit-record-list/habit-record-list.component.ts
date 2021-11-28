import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { UserHabit, UserHabitRecordView } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-record-list',
  templateUrl: './habit-record-list.component.html',
  styleUrls: ['./habit-record-list.component.scss'],
})
export class HabitRecordListComponent implements OnInit {
  arRecords: UserHabitRecordView[] = [];
  displayedColumns: string[] = ['targetUser', 'habitname', 'recordDate', 'subID', 'completeFact', 'ruleID', 'contDays', 'comment'];
  recordCount = 0;

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

  public onCreateRecord(): void {
    this.uiUtilSrv.navigateHabitRecordCreatePage();
  }

  public refreshList(): void {
    this.odataSrv.getUserHabitRecordViews(100, 0).subscribe({
      next: val => {
        this.arRecords = val.items.slice();
        this.recordCount = val.totalCount;
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }

  public onDisplayRecord(row: UserHabitRecordView): void {
    this.uiUtilSrv.currentUserHabitRecord = row;

    this.uiUtilSrv.navigateHabitRecordDisplayPage();
  }
  public onDeleteRecord(row: UserHabitRecordView): void {
    // TBD: delete record.
  }
}
