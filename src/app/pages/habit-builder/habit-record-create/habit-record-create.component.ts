import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';
import { forkJoin } from 'rxjs';

import { AwardUserView, HabitCompleteCategory, momentDateFormat, UserHabit, UserHabitRecord,
  getHabitCompleteCategoryName, HabitFrequency, getHabitFrequencyName, } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

class AvailableHabit {
  HabitID: number | undefined = undefined;
  HabitName: string = '';
  Frequency: HabitFrequency = HabitFrequency.Daily;
  CompleteCategory: HabitCompleteCategory = HabitCompleteCategory.NumberOfTimes;;
  CompleteFact: boolean | number | null = null;
  get completeCategoryString(): string {
    return (+this.CompleteCategory).toString();
  }
}

@Component({
  selector: 'app-habit-record-create',
  templateUrl: './habit-record-create.component.html',
  styleUrls: ['./habit-record-create.component.scss'],
})
export class HabitRecordCreateComponent implements OnInit {
  currentObject: UserHabitRecord | null = null;
  firstFormGroup: FormGroup;
  arHabits: AvailableHabit[] = [];
  displayedColumns: string[] = ['hid', 'name', 'frequency', 'compCategory', 'compFact'];

  constructor(private _formBuilder: FormBuilder,
    private uiUtilSrv: UIUtilityService,
    private odataSrv: ODataService) {
      this.firstFormGroup = this._formBuilder.group({
        targetuserCtrl: new FormControl('', Validators.required),
        dateCtrl: new FormControl(moment(), Validators.required),
      });
    }

  get arTargetUsers(): AwardUserView[] {
    if (this.odataSrv.currentUserDetail) {
      return this.odataSrv.currentUserDetail.awardUsers;
    }
    return [];
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
  public getHabitCompleteCategoryName(cc: HabitCompleteCategory): string {
    return getHabitCompleteCategoryName(cc);
  }
  public getHabitFrequencyName(frq: HabitFrequency): string {
    return getHabitFrequencyName(frq);
  }

  ngOnInit(): void {
  }

  public onUserSelected() : void {
    // Get the result
    let tgtuser = this.firstFormGroup.get('targetuserCtrl')?.value;
    let pickedDate = this.firstFormGroup.get('dateCtrl')?.value.format(momentDateFormat);

    this.odataSrv.getUserHabits(100, 0, undefined, undefined, `TargetUser eq '${tgtuser}' and ValidFrom le ${pickedDate} and ValidTo ge ${pickedDate}`).subscribe({
      next: (val: {totalCount: number; items: UserHabit[]}) => {
        this.arHabits = [];
        val.items.forEach(item => {
          let habit = new AvailableHabit();
          habit.HabitID = item.ID;
          habit.HabitName = item.name;
          habit.Frequency = item.frequency;
          habit.CompleteCategory = item.completeCategory;
          habit.CompleteFact = null;
          this.arHabits.push(habit);
        });
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err, 1500);
      }
    });
  }
  get isHabitStepCompleted(): boolean {
    if (!this.arHabits) {
      return false;
    }

    let bFound = false;
    this.arHabits.forEach(val => {
      if (val.CompleteFact) {
        bFound = true;
      }
    });
    return bFound;
  }
  public onSaveRecord(): void {
    // Save the records
    let arreq: any[] = [];
    this.arHabits.forEach(hbt => {
      if (hbt.CompleteFact !== null) {
        const record = new UserHabitRecord();
        record.completeFact = +hbt.CompleteFact;
        record.habitID = hbt.HabitID;
        record.recordDate = this.firstFormGroup.get('dateCtrl')?.value;
        
        arreq.push(this.odataSrv.createUserHabitRecord(record));
      }
    });

    forkJoin(arreq).subscribe({
      next: val => {
        console.log(val);
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err, 1500);
      }
    })
  }
}
