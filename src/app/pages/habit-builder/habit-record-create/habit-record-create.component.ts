import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { Observable, forkJoin } from 'rxjs';
import { SafeAny } from 'src/app/common';

import {
  AwardUserView,
  HabitCompleteCategory,
  momentDateFormat,
  UserHabit,
  UserHabitRecord,
  getHabitCompleteCategoryName,
  HabitFrequency,
  getHabitFrequencyName,
} from 'src/app/models';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';

class AvailableHabit {
  HabitID: number | undefined = undefined;
  HabitName = '';
  Frequency: HabitFrequency = HabitFrequency.Daily;
  CompleteCategory: HabitCompleteCategory = HabitCompleteCategory.NumberOfTimes;
  CompleteFact: boolean | number | null = null;
  get completeCategoryString(): string {
    return (+this.CompleteCategory).toString();
  }
}

@Component({
  selector: 'khb-habit-record-create',
  templateUrl: './habit-record-create.component.html',
  styleUrls: ['./habit-record-create.component.scss'],
})
export class HabitRecordCreateComponent {
  currentObject: UserHabitRecord | null = null;
  firstFormGroup: UntypedFormGroup;
  arHabits: AvailableHabit[] = [];
  displayedColumns: string[] = ['hid', 'name', 'frequency', 'compCategory', 'compFact'];

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private uiUtilSrv: UIUtilityService,
    private authService: AuthService,
    private odataSrv: ODataService
  ) {
    this.firstFormGroup = this._formBuilder.group({
      targetuserCtrl: new UntypedFormControl('', Validators.required),
      dateCtrl: new UntypedFormControl(moment(), Validators.required),
    });
  }

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
  public getHabitCompleteCategoryName(cc: HabitCompleteCategory): string {
    return getHabitCompleteCategoryName(cc);
  }
  public getHabitFrequencyName(frq: HabitFrequency): string {
    return getHabitFrequencyName(frq);
  }

  public onUserSelected(): void {
    // Get the result
    const tgtuser = this.firstFormGroup.get('targetuserCtrl')?.value;
    const pickedDate = this.firstFormGroup.get('dateCtrl')?.value.format(momentDateFormat);

    this.odataSrv.getUserHabits(100, 0, undefined, undefined, `TargetUser eq '${tgtuser}' and ValidFrom le ${pickedDate} and ValidTo ge ${pickedDate}`)
      .subscribe({
        next: (val: { totalCount: number; items: UserHabit[] }) => {
          this.arHabits = [];
          val.items.forEach((item) => {
            const habit = new AvailableHabit();
            habit.HabitID = item.ID;
            habit.HabitName = item.name;
            habit.Frequency = item.frequency;
            habit.CompleteCategory = item.completeCategory;
            habit.CompleteFact = null;
            this.arHabits.push(habit);
          });
        },
        error: (err) => {
          this.uiUtilSrv.showSnackInfo(err, 1500);
        },
      });
  }
  get isHabitStepCompleted(): boolean {
    if (!this.arHabits) {
      return false;
    }

    let bFound = false;
    this.arHabits.forEach((val) => {
      if (val.CompleteFact) {
        bFound = true;
      }
    });
    return bFound;
  }
  public onSaveRecord(): void {
    // Save the records
    const arreq: Array<Observable<SafeAny>> = [];

    this.arHabits.forEach((hbt) => {
      if (hbt.CompleteFact !== null) {
        const record = new UserHabitRecord();
        record.completeFact = +hbt.CompleteFact;
        record.habitID = hbt.HabitID;
        record.recordDate = this.firstFormGroup.get('dateCtrl')?.value;

        arreq.push(this.odataSrv.createUserHabitRecord(record));
      }
    });

    forkJoin(arreq).subscribe({
      next: (val) => {
        console.debug(val);
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err, 1500);
      },
    });
  }
}
