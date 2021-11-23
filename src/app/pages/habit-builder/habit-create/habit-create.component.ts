import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { UIMode } from 'actslib';
import moment from 'moment';

import { AwardUserView, getHabitCategoryNames, getHabitCompleteCategoryNames, getHabitFrequencyNames, 
  HabitCategory, HabitCompleteCategory, 
  HabitFrequency, UserHabit, UserHabitRule, } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

class ContinuedDaysInfo {
  from = 0;
  to = 0;
  public toString(): string {
    return `[${this.from} - ${this.to})`;
  }
}

// class PointInfo {
//   dimInfo: DimensionInfo;
//   points: { [key: string]: number } = {};
//   isEdit = false;

//   constructor(dim: DimensionInfo, ) {
//     this.dimInfo = dim;
//   }
// }

@Component({
  selector: 'app-habit-create',
  templateUrl: './habit-create.component.html',
  styleUrls: ['./habit-create.component.scss'],
})
export class HabitCreateComponent implements OnInit {
  // Step 1: HEADER
  firstFormGroup: FormGroup;
  arRuleTypes: any[] = [];
  // Step 2: DAYS
  secondFormGroup: FormGroup;
  contDays: ContinuedDaysInfo[] = [];
  // Step 3: POINTS
  displayedColumns: string[] = ['dimension'];
  // dataSource: PointInfo[] = [];
  pointCompleted = false;
  createdGroupID = -1;

  uiMode: UIMode = UIMode.Create;
  currentMode = 'Common.Create';
  arCategories: any[] = [];
  arFrequencies: any[] = [];
  arCompleteCategories: any[] = [];
  currentObject: UserHabit | null = null;

  constructor(private _formBuilder: FormBuilder,
    private uiUtilSrv: UIUtilityService,
    private odataSrv: ODataService) {
      this.arCategories = getHabitCategoryNames();
      this.arFrequencies = getHabitFrequencyNames();
      this.arCompleteCategories = getHabitCompleteCategoryNames();

      this.firstFormGroup = this._formBuilder.group({
        targetuserCtrl: new FormControl(''),
        nameCtrl: new FormControl('', Validators.required),
        // ctgyCtrl: new FormControl(HabitCategory.Positive, Validators.required),
        validFromCtrl: new FormControl(moment(), Validators.required),
        validToCtrl: new FormControl(moment(), Validators.required),
        freqCtrl: new FormControl(HabitFrequency.Daily, Validators.required),
        compCtgyCtrl: new FormControl(HabitCompleteCategory.NumberOfTimes, Validators.required),
        compCondCtrl: new FormControl(),
        startDateCtrl: new FormControl()
      });
      this.secondFormGroup = this._formBuilder.group({
        rawCtrl: new FormControl('', Validators.required)
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
  get isDisplayMode(): boolean {
    return this.uiMode === UIMode.Display;
  }
  get isCreateMode(): boolean {
    return this.uiMode === UIMode.Create;
  }
  get isUpdateMode(): boolean {
    return this.uiMode === UIMode.Update;
  }
  get isEditable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Update;
  }
  ngOnInit(): void {
  }

  public onInitialRules(): void {
    // Init. the rules
  }
}
