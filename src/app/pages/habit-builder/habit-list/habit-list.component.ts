import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { UserHabit } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss']
})
export class HabitListComponent implements OnInit {

  dataSource: UserHabit[] = [];
  displayedColumns: string[] = ['id', 'targetUser', 'category', 'validity', 'name'];
  recordCount = 0;

  constructor(private odataSrv: ODataService,
    public dialog: MatDialog,
    public uiUtilSrv: UIUtilityService) { }

  ngOnInit(): void {
    // this.odataSrv.getAwardUserViews().subscribe();

    this.refreshList();
  }

  get isExpertMode(): boolean {
    return this.odataSrv.isLoggedin;
  }
  // public getAwardRuleTypeName(ruleType: AwardRuleTypeEnum): string {
  //   return getAwardRuleTypeName(ruleType);
  // }
  public getUserDisplayAs(usrId: string): string {
    if (usrId && this.odataSrv.currentUserDetail) {
      const idx = this.odataSrv.currentUserDetail.awardUsers.findIndex(val => val.targetUser === usrId);
      if (idx !== -1) {
        return this.odataSrv.currentUserDetail.awardUsers[idx].displayAs;
      }
    }
    return '';
  }

  public onCreateHabit(): void {
    this.uiUtilSrv.navigateHabitCreatePage();
  }

  public refreshList(): void {
    this.odataSrv.getUserHabits(100, 0, undefined).subscribe({
      next: val => {
        this.dataSource = val.items.slice();
        this.recordCount = val.totalCount;
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }

  public onDeleteRuleGroup(rid: number): void {
    this.odataSrv.deleteAwardRuleGroup(rid).subscribe({
      next: val => {
        this.refreshList();
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }
  public onDisplayHabit(hid: number): void {
    this.uiUtilSrv.navigateHabitDisplayPage(hid);
  }
}
