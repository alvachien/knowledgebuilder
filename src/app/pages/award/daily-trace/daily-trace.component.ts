/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DailyTrace } from 'src/app/models';
import { ODataService } from 'src/app/services';

@Component({
  selector: 'app-daily-trace',
  templateUrl: './daily-trace.component.html',
  styleUrls: ['./daily-trace.component.scss']
})
export class DailyTraceComponent implements OnInit {

  dataSourceTrace: DailyTrace[] = [];
  traceLength = 0;
  displayedColumns: string[] = ['targetUser', 'recordDate', 'schoolWorkTime', 'goToBedTime', 'homeWorkCount',
    'bodyExerciseCount', 'errorsCollection', 'handWriting', 'cleanDesk', 'houseKeepingCount', 'politeBehavior'];

  constructor(private odataSrv: ODataService,
    public dialog: MatDialog) { }

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
            // TBD.
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
