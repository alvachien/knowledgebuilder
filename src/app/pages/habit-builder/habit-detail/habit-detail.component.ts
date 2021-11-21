import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UIMode } from 'actslib';

import { AwardUserView, getHabitCategoryNames, getHabitCompleteCategoryNames, getHabitFrequencyNames, HabitCategory, HabitCompleteCategory, HabitFrequency, UserHabit, UserHabitRule, } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-detail',
  templateUrl: './habit-detail.component.html',
  styleUrls: ['./habit-detail.component.scss'],
})
export class HabitDetailComponent implements OnInit {

  firstFormGroup: FormGroup;
  uiMode: UIMode = UIMode.Create;
  currentMode = 'Common.Create';
  arCategories: any[] = [];
  arFrequencies: any[] = [];
  arCompleteCategories: any[] = [];

  constructor(private _formBuilder: FormBuilder,
    private uiUtilSrv: UIUtilityService,
    private odataSrv: ODataService) {
      this.arCategories = getHabitCategoryNames();
      this.arFrequencies = getHabitFrequencyNames();
      this.arCompleteCategories = getHabitCompleteCategoryNames();

      this.firstFormGroup = this._formBuilder.group({
        targetuserCtrl: ['', Validators.required],
        nameCtrl: ['', Validators.required],
        ctgyCtrl: [HabitCategory.Positive, Validators.required],
        validFromCtrl: [undefined, Validators.required],
        validToCtrl: [undefined, Validators.required],
        freqCtrl: [HabitFrequency.Daily, Validators.required],
        compCtgyCtrl: [HabitCompleteCategory.NumberOfTimes, Validators.required],
        compCondCtrl: [0],
        startDateCtrl: [undefined]
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
  
  ngOnInit(): void {
  }

  onSave(): void {
    // Save the date
  }
}
