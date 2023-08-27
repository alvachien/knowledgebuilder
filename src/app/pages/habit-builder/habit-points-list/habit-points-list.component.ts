import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { forkJoin } from 'rxjs';
import { SafeAny } from 'src/app/common';

import {
  UserHabitPointsByUserDate,
  UserHabitPoint,
  UserHabitPointReport,
  momentDateFormat,
  AwardUserView,
  UserHabitRecordView,
} from 'src/app/models';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'khb-habit-points-list',
  templateUrl: './habit-points-list.component.html',
  styleUrls: ['./habit-points-list.component.scss'],
})
export class HabitPointsListComponent implements OnInit {
  displayedColumnsManualPoint: string[] = ['id', 'targetUser', 'recordDate', 'point', 'comment'];
  dataSourceManualPoints: UserHabitPoint[] = [];
  displayedColumnsHabitPoint: string[] = [
    'targetUser',
    'recordDate',
    'habitid',
    'habitName',
    'ruleDaysFrom',
    'ruleDaysTo',
    'point',
  ];
  dataSourceHabitPoints: UserHabitRecordView[] = [];
  selectedUser: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartOption: any;
  selectedPeriod = '2';
  showManualPointResult = false;
  showHabitPointResult = false;

  constructor(
    private odataSrv: ODataService,
    public dialog: MatDialog,
    public authService: AuthService,
    public uiUtilSrv: UIUtilityService
  ) {}

  get arTargetUsers(): AwardUserView[] {
    if (this.authService.userDetail) {
      return this.authService.userDetail.awardUsers;
    }
    return [];
  }
  public getUserDisplayAs(usrId: string): string {
    if (usrId && this.authService.userDetail) {
      const idx = this.authService.userDetail.awardUsers.findIndex((val) => val.targetUser === usrId);
      if (idx !== -1) {
        return this.authService.userDetail.awardUsers[idx].displayAs;
      }
    }
    return '';
  }

  ngOnInit(): void {
    this.selectedPeriod = '2';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public onReportParameterSelectionChange(event: SafeAny) {
    if (this.selectedUser !== null) {
      this.refreshData();
    }
  }

  public refreshData(): void {
    // Current Month
    const dateEnd: moment.Moment = moment();
    let daysInAxis = moment.duration(1, 'months').asDays();
    if (this.selectedPeriod === '1') {
      daysInAxis = moment.duration(1, 'weeks').asDays();
    }
    const dateBgn = dateEnd.clone().subtract(daysInAxis, 'days');
    const arAxis: string[] = [];
    const daysInAxisOrigin = daysInAxis;
    while (daysInAxis >= 0) {
      arAxis.push(dateEnd.clone().subtract(daysInAxis, 'days').format(momentDateFormat));
      daysInAxis--;
    }
    const filterstr = `TargetUser eq '${this.selectedUser}' and RecordDate ge ${dateBgn.format(
      momentDateFormat
    )} and RecordDate le ${dateEnd.format(momentDateFormat)}`;

    const arSeries: SafeAny[] = [];
    forkJoin([
      this.odataSrv.getHabitOpeningPointsByUserDate(this.selectedUser ?? '', daysInAxisOrigin),
      this.odataSrv.getHabitPointsByUserDateReport(filterstr),
      this.odataSrv.getUserOpeningPointReport(this.selectedUser ?? '', daysInAxisOrigin),
      this.odataSrv.getUserHabitPointReports(filterstr),
    ]).subscribe({
      next: (val: SafeAny[]) => {
        const openPoint1 = val[0] as number;
        const arHabitPoints = val[1] as UserHabitPointsByUserDate[];
        const openPoint2 = val[2] as number;
        const arManualPoints = val[3] as UserHabitPointReport[];

        const habitData: number[] = [];
        const manualData: number[] = [];
        const sumData: number[] = [];
        let prvHabitPoint = 0;
        let prvManualPoint = 0;
        let prvSumPoint = openPoint1 + openPoint2;

        arAxis.forEach((axisDate) => {
          const idxUserDate = arHabitPoints.findIndex((val) => val.recordDateString === axisDate);
          if (idxUserDate !== -1) {
            prvHabitPoint = arHabitPoints[idxUserDate].point;
          } else {
            prvHabitPoint = 0;
          }
          habitData.push(prvHabitPoint);

          const idxManual = arManualPoints.findIndex((val) => val.recordDateString === axisDate);
          if (idxManual !== -1) {
            prvManualPoint += arManualPoints[idxManual].point;
          } else {
            prvManualPoint = 0;
          }
          manualData.push(prvManualPoint);

          prvSumPoint += prvHabitPoint + prvManualPoint;
          sumData.push(prvSumPoint);
        });

        // Habit
        const habitObj = {
          name: 'Points from Habits',
          type: 'bar',
          emphasis: {
            focus: 'series',
          },
          data: habitData,
        };
        arSeries.push(habitObj);

        // Manual
        const ManualObj = {
          name: 'Manual Points',
          type: 'bar',
          emphasis: {
            focus: 'series',
          },
          data: manualData,
        };
        arSeries.push(ManualObj);

        // Total
        const totalObj = {
          name: 'Total Points',
          type: 'bar',
          emphasis: {
            focus: 'series',
          },
          data: sumData,
        };
        arSeries.push(totalObj);

        this.chartOption = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          legend: {},
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: [
            {
              type: 'category',
              data: arAxis,
            },
          ],
          yAxis: [
            {
              type: 'value',
            },
          ],
          series: arSeries,
        };
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
    });
  }

  onChartClick(event: SafeAny): void {
    if (event.seriesIndex === 0) {
      // Points from habit.
      this.showHabitPointResult = true;
      this.dataSourceHabitPoints = [];

      const filterStr = `RecordDate eq ${event.name} and TargetUser eq '${this.selectedUser}' and RulePoint gt 0`;
      this.odataSrv.getUserHabitRecordViews(100, 0, undefined, undefined, filterStr).subscribe({
        next: (val) => {
          this.dataSourceHabitPoints = val.items;
        },
        error: (err) => {
          this.uiUtilSrv.showSnackInfo(err);
        },
      });
    } else if (event.seriesIndex === 1) {
      // Points from manual input.
      if (event.name) {
        this.showManualPointResult = true;
        this.dataSourceManualPoints = [];

        const filterStr = `RecordDate eq ${event.name} and TargetUser eq '${this.selectedUser}'`;
        this.odataSrv.getHabitPoints(filterStr).subscribe({
          next: (val) => {
            this.dataSourceManualPoints = val as UserHabitPoint[];
          },
          error: (err) => {
            this.uiUtilSrv.showSnackInfo(err);
          },
        });
      }
    }
  }

  onHideManualPoints(): void {
    this.showManualPointResult = false;
  }

  onHideHabitPoints(): void {
    this.showHabitPointResult = false;
  }

  public onDeleteManualPoint(pid: number) {
    // Delete point
    this.odataSrv.deleteHabitPoint(pid).subscribe({
      next: () => {
        this.uiUtilSrv.showSnackInfo('DONE');
        this.showManualPointResult = false;
        this.refreshData();
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
    });
  }

  public onCreatePoint(): void {
    // Create new trace
    const dialogRef = this.dialog.open(HabitPointCreateDialog, {
      width: '600px',
      closeOnNavigation: false,
      data: new UserHabitPoint(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.odataSrv.createHabitPoint(result).subscribe({
          next: () => {
            this.refreshData();
          },
          error: (err) => {
            this.uiUtilSrv.showSnackInfo(err);
          },
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
  constructor(
    public dialogRef: MatDialogRef<HabitPointCreateDialog>,
    public oDataSrv: ODataService,
    public authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: UserHabitPoint
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
