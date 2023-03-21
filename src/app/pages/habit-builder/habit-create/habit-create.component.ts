import { Component, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import moment from 'moment';

import {
  AwardUserView,
  getHabitCategoryNames,
  getHabitCompleteCategoryNames,
  getHabitFrequencyNames,
  HabitCategory,
  HabitCompleteCategory,
  HabitFrequency,
  UserHabit,
  UserHabitRule,
} from 'src/app/models';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';

class ContinuedDaysInfo {
  from = 0;
  to = 0;
  public toString(): string {
    return `[${this.from} - ${this.to})`;
  }
}

export const getHabitFromForm = (form: UntypedFormGroup): UserHabit => {
  const habit: UserHabit = new UserHabit();
  habit.category = HabitCategory.Positive;
  habit.targetUser = form.get('targetuserCtrl')?.value;
  habit.validFrom = moment(form.get('validFromCtrl')?.value);
  habit.validTo = moment(form.get('validToCtrl')?.value);
  habit.name = form.get('nameCtrl')?.value;
  habit.frequency = form.get('freqCtrl')?.value;
  habit.completeCategory = form.get('compCtgyCtrl')?.value;

  switch (habit.frequency) {
    case HabitFrequency.Weekly:
      {
        switch (habit.completeCategory) {
          case HabitCompleteCategory.NumberOfCount:
            {
              habit.startDate = form.get('startDateCtrl')?.value;
              habit.completeCondition = form.get('compCondCtrl')?.value;
            }
            break;

          case HabitCompleteCategory.NumberOfTimes:
          default:
            {
              habit.startDate = form.get('startDateCtrl')?.value;
              habit.completeCondition = form.get('compCondCtrl')?.value;
            }
            break;
        }
      }
      break;

    case HabitFrequency.Monthly:
      {
        switch (habit.completeCategory) {
          case HabitCompleteCategory.NumberOfCount:
            {
              habit.startDate = form.get('startDateCtrl')?.value;
              habit.completeCondition = form.get('compCondCtrl')?.value;
            }
            break;

          case HabitCompleteCategory.NumberOfTimes:
          default:
            {
              habit.startDate = form.get('startDateCtrl')?.value;
              habit.completeCondition = form.get('compCondCtrl')?.value;
            }
            break;
        }
      }
      break;

    case HabitFrequency.Daily:
    default:
      {
        switch (habit.completeCategory) {
          case HabitCompleteCategory.NumberOfCount:
            {
              habit.startDate = undefined;
              habit.completeCondition = form.get('compCondCtrl')?.value;
            }
            break;

          case HabitCompleteCategory.NumberOfTimes:
          default:
            {
              habit.startDate = undefined;
              habit.completeCondition = 1;
            }
            break;
        }
      }
      break;
  }
  return habit;
};

export const habitFormValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const habit = getHabitFromForm(control as UntypedFormGroup);

  return habit.isValid ? null : { invalidInputs: true };
};

@Component({
  selector: 'app-habit-create',
  templateUrl: './habit-create.component.html',
  styleUrls: ['./habit-create.component.scss'],
})
export class HabitCreateComponent implements OnInit {
  // Step 1: HEADER
  firstFormGroup: UntypedFormGroup;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arRuleTypes: any[] = [];
  // Step 2: DAYS
  secondFormGroup: UntypedFormGroup;
  contDays: ContinuedDaysInfo[] = [];
  // Step 3: RULES
  arRules: UserHabitRule[] = [];
  displayedColumns: string[] = ['ruleID', 'continuousDays', 'point'];
  pointCompleted = false;
  createdHabitID = -1;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arCategories: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arFrequencies: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arCompleteCategories: any[] = [];
  currentObject: UserHabit;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private uiUtilSrv: UIUtilityService,
    private authService: AuthService,
    private odataSrv: ODataService
  ) {
    this.arCategories = getHabitCategoryNames();
    this.arFrequencies = getHabitFrequencyNames();
    this.arCompleteCategories = getHabitCompleteCategoryNames();

    this.currentObject = new UserHabit();
    this.firstFormGroup = this._formBuilder.group(
      {
        targetuserCtrl: new UntypedFormControl(''),
        nameCtrl: new UntypedFormControl('', Validators.required),
        // ctgyCtrl: new FormControl(HabitCategory.Positive, Validators.required),
        validFromCtrl: new UntypedFormControl(moment(), Validators.required),
        validToCtrl: new UntypedFormControl(moment(), Validators.required),
        freqCtrl: new UntypedFormControl(HabitFrequency.Weekly, Validators.required),
        compCtgyCtrl: new UntypedFormControl(HabitCompleteCategory.NumberOfTimes, Validators.required),
        compCondCtrl: new UntypedFormControl(),
        startDateCtrl: new UntypedFormControl(),
      },
      { validators: habitFormValidator }
    );
    this.secondFormGroup = this._formBuilder.group({
      rawCtrl: new UntypedFormControl('', Validators.required),
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
  ngOnInit(): void {
    this.firstFormGroup.get('freqCtrl')?.valueChanges.subscribe((val) => {
      this.onFreqencyAndCompleteCategoryChange(val);
    });
    this.firstFormGroup.get('compCtgyCtrl')?.valueChanges.subscribe((val) => {
      this.onFreqencyAndCompleteCategoryChange(val);
    });
    this.secondFormGroup.get('rawCtrl')?.valueChanges.subscribe((val) => {
      this.onContDayChange(val);
    });
  }

  // Step 1: Habit
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onFreqencyAndCompleteCategoryChange(val: any): void {
    const compCtgy: HabitCompleteCategory = this.firstFormGroup.get('compCtgyCtrl')?.value as HabitCompleteCategory;
    const frq: HabitFrequency = this.firstFormGroup.get('freqCtrl')?.value as HabitFrequency;
    if (frq === HabitFrequency.Daily) {
      if (compCtgy === HabitCompleteCategory.NumberOfTimes) {
        this.firstFormGroup.get('compCondCtrl')?.disable();
      } else {
        this.firstFormGroup.get('compCondCtrl')?.enable();
      }
      this.firstFormGroup.get('startDateCtrl')?.disable();
    } else {
      this.firstFormGroup.get('compCondCtrl')?.enable();
      this.firstFormGroup.get('startDateCtrl')?.enable();
    }
  }

  // Step 2: Continuous days
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onContDayChange(val: any) {
    this.contDays = [];

    if (val) {
      const subd = val.split(';');
      let submap = subd.map((v: string | number) => {
        if (v) {
          const tp = +v;
          if (!isNaN(tp)) {
            if (tp > 0) {
              return Math.trunc(tp);
            }
          }
        }
        return 0;
      });
      submap = submap.filter((v: number) => v > 0);
      submap.sort();
      let daycur = 0;
      submap.forEach((sd: number) => {
        if (daycur !== 0) {
          const di = new ContinuedDaysInfo();
          di.from = daycur;
          di.to = sd;
          this.contDays.push(di);
        }
        daycur = sd;
      });
      const di2 = new ContinuedDaysInfo();
      di2.from = daycur;
      di2.to = 9999;
      this.contDays.push(di2);
    }
  }

  // Step 3: Points
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onPointCellChanged(event: any): void {
    let failcnt = 0;
    this.arRules.forEach((row) => {
      if (isNaN(row.point)) {
        failcnt++;
      } else {
        if (row.point === 0) {
          failcnt++;
        }
      }
    });

    this.pointCompleted = failcnt === 0 ? true : false;
  }
  public onInitialRules(): void {
    // Init. the rules
    this.arRules = [];

    this.contDays.forEach((value: ContinuedDaysInfo, index: number) => {
      const nr: UserHabitRule = new UserHabitRule();
      nr.ruleID = index + 1;
      nr.continuousRecordFrom = value.from;
      nr.continuousRecordTo = value.to;
      this.arRules.push(nr);
    });
  }
  public onSave(): void {
    // On Save
    const nobj: UserHabit = getHabitFromForm(this.firstFormGroup);
    if (!nobj.isValid) {
      return;
    }

    // Add the rules.
    this.arRules.forEach((rule) => {
      nobj.arRules.push(rule);
    });

    this.odataSrv.createUserHabit(nobj).subscribe({
      next: (val) => {
        // New habit
        if (val && val.ID) {
          this.createdHabitID = val.ID;
        }
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err, 1000);
      },
    });
  }
  public onGoToList(): void {
    this.uiUtilSrv.navigateHabitListPage();
  }
  public onDisplayHabit(): void {
    if (this.createdHabitID) {
      this.uiUtilSrv.navigateHabitDisplayPage(this.createdHabitID);
    }
  }
}
