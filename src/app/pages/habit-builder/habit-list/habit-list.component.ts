import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { UserHabit, getHabitCategoryName, HabitCategory, getHabitCompleteCategoryName,
  getHabitFrequencyName, HabitCompleteCategory, HabitFrequency,  } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-list',
  templateUrl: './habit-list.component.html',
  styleUrls: ['./habit-list.component.scss']
})
export class HabitListComponent implements OnInit {

  dataSource: UserHabit[] = [];
  displayedColumns: string[] = ['id', 'targetUser', 'name', 'frequency', 'compCategory', 'validity', ];
  recordCount = 0;

  constructor(private odataSrv: ODataService,
    public dialog: MatDialog,
    public uiUtilSrv: UIUtilityService) { }

  ngOnInit(): void {
    // this.odataSrv.getAwardUserViews().subscribe();

    this.refreshList();
  }

  public getHabitCategoryName(hc: HabitCategory): string {
    return getHabitCategoryName(hc);
  }
  public getHabitCompleteCategoryName(cc: HabitCompleteCategory): string {
    return getHabitCompleteCategoryName(cc);
  }
  public getHabitFrequencyName(frq: HabitFrequency): string {
    return getHabitFrequencyName(frq);
  }
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

  public onDeleteHabit(hid: number): void {
    this.odataSrv.deleteUserHabit(hid).subscribe({
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
