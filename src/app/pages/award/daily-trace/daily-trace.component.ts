/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AwardPoint, DailyTrace, momentDateFormat } from 'src/app/models';
import { ODataService } from 'src/app/services';

@Component({
  selector: 'app-daily-trace',
  templateUrl: './daily-trace.component.html',
  styleUrls: ['./daily-trace.component.scss']
})
export class DailyTraceComponent implements OnInit {

  dataSourceTrace: DailyTrace[] = [];
  dataSourcePoints: AwardPoint[] = [];
  traceLength = 0;
  displayedColumns: string[] = ['action', 'targetUser', 'recordDate', 'schoolWorkTime', 'goToBedTime', 'homeWorkCount',
    'bodyExerciseCount', 'errorsCollection', 'handWriting', 'cleanDesk', 'houseKeepingCount', 'politeBehavior'];
  displayedPointColumns: string[] = ['action', 'targetUser', 'recordDate', 'matchedRuleID', 'countOfDay', 'point', 'comment'];
  selectedUser = '';
  selectedDate = '';
  isPointShow = false;

  constructor(private odataSrv: ODataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.refreshList();
  }

  onCreateTrace(): void {
    // Create new trace
    const dialogRef = this.dialog.open(DailyTraceCreateDialog, {
      width: '600px',
      closeOnNavigation: false,
      data: new DailyTrace(),
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed with result: ${result}`);

      if (result) {
        this.odataSrv.createDailyTrace(result).subscribe({
          next: val => {
            // Refresh the list page
            this.refreshList();
          },
          error: err => {
            this.snackBar.open(err, undefined, { duration: 2000 });
          }
        });
      }
    });
  }

  refreshList(): void {
    this.odataSrv.getDailyTrace(100, 0).subscribe({
      next: val => {
        this.dataSourceTrace = val.items.slice();
        this.traceLength = val.totalCount;
      },
      error: err => {
        this.snackBar.open(err, undefined, { duration: 2000 });
      }
    });
  }
  onGetPoints(targetUser: string, recordDate: moment.Moment) {
    this.odataSrv.getAwardPoints(100, 0, undefined, `TargetUser eq '${targetUser}' AND RecordDate eq ${recordDate.format(momentDateFormat)}`).subscribe({
      next: val => {
        this.selectedUser = targetUser;
        this.selectedDate = recordDate.format(momentDateFormat);

        this.dataSourcePoints = [];
        this.dataSourcePoints = val.items.slice();
        // console.log(val);

        this.isPointShow = true;
      },
      error: err => {
        this.snackBar.open(err, undefined, { duration: 2000 });
      }
    });
  }
  onDeleteTrace(targetUser: string, recordDate: moment.Moment): void {
    this.odataSrv.deleteDailyTrace(targetUser, recordDate).subscribe({
      next: val => {
        this.isPointShow = false;
        this.refreshList();
      },
      error: err => {
        this.snackBar.open(err, undefined, { duration: 2000 });
      }
    });
  }
  onHidePoints(): void {
    this.selectedDate = '';
    this.selectedUser = '';
    this.dataSourcePoints = [];

    this.isPointShow = false;
  }
  onDeletePoint(pid: number): void {
    this.odataSrv.deleteAwardPoint(pid).subscribe({
      next: val => {
        // Refresh
        this.onGetPoints(this.selectedUser, moment(this.selectedDate));
      },
      error: err => {
        this.snackBar.open(err, undefined, { duration: 2000 });
      }
    });
  }
}

@Component({
  selector: 'app-daily-trace-create-dialog',
  templateUrl: 'daily-trace-create.dialog.html',
  styleUrls: ['./daily-trace.component.scss'],
})
export class DailyTraceCreateDialog {

  constructor(public dialogRef: MatDialogRef<DailyTraceCreateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DailyTrace) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
