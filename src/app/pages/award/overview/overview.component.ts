import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AwardPoint, AwardPointReport } from 'src/app/models';
import { ODataService } from 'src/app/services';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  dataSource: AwardPointReport[] = [];
  recordCount = 0;
  displayedColumns: string[] = ['targetUser', 'recordDate', 'point', 'aggpoint'];

  constructor(private oDataSrv: ODataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.refreshList();
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
            this.snackBar.open(err, undefined, { duration: 2000 });
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
        this.snackBar.open(err, undefined, { duration: 2000 });
      }
    });
  }
}

@Component({
  selector: 'app-overview-award-point-crtdlg',
  templateUrl: 'award-point-create.dialog.html',
  styleUrls: ['./overview.component.scss'],
})
export class AwardPointCreateDialog {

  constructor(public dialogRef: MatDialogRef<AwardPointCreateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AwardPoint) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

