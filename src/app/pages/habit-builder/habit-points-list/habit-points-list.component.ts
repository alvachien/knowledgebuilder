import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { forkJoin } from 'rxjs';

import { UserHabitPointsByUserDate, UserHabitPointsByUserHabitDate, UserHabitPoint, 
  UserHabitPointReport,
  UserHabit,
  momentDateFormat, } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-points-list',
  templateUrl: './habit-points-list.component.html',
  styleUrls: ['./habit-points-list.component.scss'],
})
export class HabitPointsListComponent implements OnInit {
  dataSourceUserDate: UserHabitPointsByUserDate[] = [];
  // dataSourceUserHabitDate: UserHabitPointsByUserHabitDate[] = [];
  displayedColumns: string[] = ['targetUser', 'recordDate', 'point'];
  dataSourcePoints: UserHabitPointReport[] = [];
  // displayedColumns2: string[] = ['targetUser', 'habitID', 'recordDate', 'point'];
  recordCount = 0;
  chartOption: any;

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
    // this.odataSrv.getHabitPointsByUserDateReport().subscribe({
    //   next: val => {
    //     this.dataSourceUserDate = val;
    //     let arAxis: any[] = [];
    //     let arValue: any[] = [];
    //     this.dataSourceUserDate.forEach(val => {
    //       arAxis.push(val.recordDateString);
    //       arValue.push(val.point);
    //     });

    //     this.chartOption = {
    //       tooltip: {
    //         trigger: 'axis',
    //         axisPointer: {
    //           type: 'shadow'
    //         }
    //       },
    //       grid: {
    //         left: '3%',
    //         right: '4%',
    //         bottom: '3%',
    //         containLabel: true
    //       },
    //       xAxis: [
    //         {
    //           type: 'category',
    //           data: arAxis,
    //           axisTick: {
    //             alignWithLabel: true
    //           }
    //         }
    //       ],
    //       yAxis: [
    //         {
    //           type: 'value'
    //         }
    //       ],
    //       series: [
    //         {
    //           name: 'Point',
    //           type: 'bar',
    //           barWidth: '60%',
    //           data: arValue
    //         }
    //       ]
    //     };
    //   },
    //   error: err  => {
    //     this.uiUtilSrv.showSnackInfo(err);
    //   }
    // });

    // this.odataSrv.getHabitPointsByUserHabitDates().subscribe({
    //   next: val => {
    //     this.dataSourceUserHabitDate = val;
    //   },
    //   error: err  => {
    //     this.uiUtilSrv.showSnackInfo(err);
    //   }
    // });
  }
  public refreshData(): void {
    this.dataSourcePoints = [];
    this.dataSourceUserDate = [];

    // Current Month
    let dateEnd: moment.Moment = moment();
    let daysInAxis = moment.duration(1, 'months').days();
    let dateBgn = dateEnd.subtract(daysInAxis, 'days');
    let arAxis: string[] = [];
    while(daysInAxis >= 0) {
      arAxis.push(dateEnd.subtract(daysInAxis, 'days').format(momentDateFormat));
      daysInAxis --;
    }
    let filterstr = `RecordDate ge ${dateBgn.format(momentDateFormat)} and RecordDate le ${dateEnd.format(momentDateFormat)}`;

    let arSeries: any[] = [];
    let arUsers: any[] = [];
    let arreq: any[] = [];
    arreq.push(this.odataSrv.getHabitPointsByUserDateReport(filterstr));
    arreq.push(this.odataSrv.getUserHabitPointReports(filterstr));
    forkJoin(arreq).subscribe({
      next: val => {
        this.dataSourceUserDate = val[0] as UserHabitPointsByUserDate[];
        this.dataSourcePoints = val[1] as UserHabitPointReport[];

        

        this.chartOption = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {},
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: [
            {
              type: 'category',
              data: arAxis,
            }
          ],
          yAxis: [
            {
              type: 'value'
            }
          ],
          series: [
            {
              name: 'Habits',
              type: 'bar',
              stack: 'usera',
              emphasis: {
                focus: 'series'
              },
              data: [0, 10, 12, 24, 30, 40, 30]
            },
            {
              name: 'Manual',
              type: 'bar',
              stack: 'usera',
              emphasis: {
                focus: 'series'
              },
              data: [0, 2, 10, 24, 30, 40, 50]
            },
            {
              name: 'Habits',
              type: 'bar',
              stack: 'userb',
              emphasis: {
                focus: 'series'
              },
              data: [0, 10, 12, 24, 30, 40, 30]
            },
            {
              name: 'Manual',
              type: 'bar',
              stack: 'userb',
              emphasis: {
                focus: 'series'
              },
              data: [2, 10, 20, 24, 30, 40, 50]
            }
          ]
        };
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }

  public onCreatePoint(): void {
    // Create new trace
    const dialogRef = this.dialog.open(HabitPointCreateDialog, {
      width: '600px',
      closeOnNavigation: false,
      data: new UserHabitPoint(),
    });

    dialogRef.afterClosed().subscribe(result => {
      // console.log(`The dialog was closed with result: ${result}`);

      if (result) {
        this.odataSrv.createHabitPoint(result).subscribe({
          next: val => {
            // Refresh the list page
            // this.refreshList();
          },
          error: err => {
            this.uiUtilSrv.showSnackInfo(err);
          }
        });
      }
    });
  }
}

@Component({
  selector: 'app-habit-point-crtdlg',
  templateUrl: 'habit-point-create.dialog.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class HabitPointCreateDialog {

  constructor(public dialogRef: MatDialogRef<HabitPointCreateDialog>,
    public oDataSrv: ODataService,
    @Inject(MAT_DIALOG_DATA) public data: UserHabitPoint) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
