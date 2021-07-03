import { Component, OnInit } from '@angular/core';
import { AwardPointReport } from 'src/app/models';
import { ODataService } from 'src/app/services';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {

  dataSource: AwardPointReport[] = [];
  recordCount = 0;
  displayedColumns: string[] = ['targetUser', 'recordDate', 'point'];
  constructor(private oDataSrv: ODataService) { }

  ngOnInit(): void {
    this.oDataSrv.getAwardPointReports(100, 0).subscribe({
      next: val => {
        this.dataSource = val.items.slice();
        this.recordCount = val.totalCount;
      },
      error: err => {
        // TBD.
      }
    });
  }
}
