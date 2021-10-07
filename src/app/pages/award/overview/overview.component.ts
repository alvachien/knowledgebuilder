import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';

import { AwardPoint, AwardPointReport, momentDateFormat } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  dataSource: AwardPointReport[] = [];
  dataSourcePoints: AwardPoint[] = [];
  recordCount = 0;
  displayedColumns: string[] = ['targetUser', 'recordDate', 'point', 'aggpoint'];
  displayedPointColumns: string[] = ['action', 'targetUser', 'recordDate', 'matchedRuleID', 'countOfDay', 'point', 'comment'];
  selectedUser = '';
  selectedDate = '';
  isPointShow = false;

  constructor(private oDataSrv: ODataService,
    public dialog: MatDialog,
    private uiUtilSrv: UIUtilityService) { }

  ngOnInit(): void {
    this.oDataSrv.getAwardUsers().subscribe();
    this.refreshList();
  }
  get isExpertMode(): boolean {
    return this.oDataSrv.expertMode;
  }

  public onCreateAward(): void {
    // Create new trace
    const dialogRef = this.dialog.open(AwardPointCreateDialog, {
      width: '600px',
      closeOnNavigation: false,
      data: new AwardPoint(),
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed with result: ${result}`);

      if (result) {
        this.oDataSrv.createAwardPoint(result).subscribe({
          next: val => {
            // Refresh the list page
            this.refreshList();
          },
          error: err => {
            this.uiUtilSrv.showSnackInfo(err);
          }
        });
      }
    });
  }
  refreshList(): void{
    this.oDataSrv.getAwardPointReports(100, 0).subscribe({
      next: val => {
        this.dataSource = val.items.slice();
        this.recordCount = val.totalCount;
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }
  onGetPoints(targetUser: string, recordDate: moment.Moment) {
    this.oDataSrv.getAwardPoints(100, 0, undefined,
      `TargetUser eq '${targetUser}' AND RecordDate eq ${recordDate.format(momentDateFormat)}`).subscribe({
      next: val => {
        this.selectedUser = targetUser;
        this.selectedDate = recordDate.format(momentDateFormat);

        this.dataSourcePoints = [];
        this.dataSourcePoints = val.items.slice();
        // console.log(val);

        this.isPointShow = true;
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
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
    this.oDataSrv.deleteAwardPoint(pid).subscribe({
      next: val => {
        // Refresh
        this.onGetPoints(this.selectedUser, moment(this.selectedDate));
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }
}

@Component({
  selector: 'app-overview-award-point-crtdlg',
  templateUrl: 'award-point-create.dialog.html',
  styleUrls: ['./overview.component.scss'],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class AwardPointCreateDialog {

  constructor(public dialogRef: MatDialogRef<AwardPointCreateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AwardPoint) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

