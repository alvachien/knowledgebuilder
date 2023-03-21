import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { UIMode } from 'actslib';

import {
  AwardUserView,
  getHabitCategoryNames,
  getHabitCompleteCategoryNames,
  getHabitFrequencyNames,
  HabitCategory,
  HabitCompleteCategory,
  HabitFrequency,
  UserHabit,
} from 'src/app/models';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-detail',
  templateUrl: './habit-detail.component.html',
  styleUrls: ['./habit-detail.component.scss'],
})
export class HabitDetailComponent implements OnInit {
  private destroyed$?: ReplaySubject<boolean>;
  routerID = -1;
  detailFormGroup: UntypedFormGroup;
  uiMode: UIMode = UIMode.Display;
  currentMode = 'Common.Display';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arCategories: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arFrequencies: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  arCompleteCategories: any[] = [];
  currentObject: UserHabit = new UserHabit();
  displayedColumns: string[] = ['ruleID', 'completedCountRange', 'point'];

  constructor(
    private activateRoute: ActivatedRoute,
    private _formBuilder: UntypedFormBuilder,
    private uiUtilSrv: UIUtilityService,
    private authService: AuthService,
    private odataSrv: ODataService
  ) {
    this.arCategories = getHabitCategoryNames();
    this.arFrequencies = getHabitFrequencyNames();
    this.arCompleteCategories = getHabitCompleteCategoryNames();

    this.detailFormGroup = this._formBuilder.group({
      targetuserCtrl: ['', Validators.required],
      nameCtrl: ['', Validators.required],
      ctgyCtrl: [HabitCategory.Positive, Validators.required],
      validFromCtrl: [undefined, Validators.required],
      validToCtrl: [undefined, Validators.required],
      freqCtrl: [HabitFrequency.Daily, Validators.required],
      compCtgyCtrl: [HabitCompleteCategory.NumberOfTimes, Validators.required],
      compCondCtrl: [0],
      startDateCtrl: [undefined],
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
  get isDisplayMode(): boolean {
    return this.uiMode === UIMode.Display;
  }
  get isUpdateMode(): boolean {
    return this.uiMode === UIMode.Update;
  }
  get isEditable(): boolean {
    return this.uiMode === UIMode.Update;
  }

  ngOnInit(): void {
    this.activateRoute.url.subscribe({
      next: (val) => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'display') {
            this.uiMode = UIMode.Display;
            this.currentMode = 'Common.Display';
            this.routerID = +val[1].path;
          } else if (val[0].path === 'edit') {
            this.uiMode = UIMode.Update;
            this.currentMode = 'Common.Change';
            this.routerID = +val[1].path;
          }
        }

        if (this.routerID !== -1) {
          this.odataSrv.readUserHabit(this.routerID).subscribe({
            next: (val) => {
              this.currentObject = val;
              this.detailFormGroup.get('targetuserCtrl')?.setValue(this.currentObject.targetUser);
              this.detailFormGroup.get('nameCtrl')?.setValue(this.currentObject.name);
              this.detailFormGroup.get('validFromCtrl')?.setValue(this.currentObject.validFrom);
              this.detailFormGroup.get('validToCtrl')?.setValue(this.currentObject.validTo);
              this.detailFormGroup.get('freqCtrl')?.setValue(this.currentObject.frequency);
              this.detailFormGroup.get('compCtgyCtrl')?.setValue(this.currentObject.completeCategory);
              this.detailFormGroup.get('compCondCtrl')?.setValue(this.currentObject.completeCondition);
              this.detailFormGroup.get('startDateCtrl')?.setValue(this.currentObject.startDate);

              if (this.uiMode === UIMode.Display) {
                this.detailFormGroup.disable();
              } else {
                this.detailFormGroup.enable();
                this.detailFormGroup.markAsPristine();
              }
            },
            error: (err) => {
              this.uiUtilSrv.showSnackInfo(err);
            },
          });
        }
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
    });
  }

  onSave(): void {
    // Save the date
  }
  onBackToList(): void {
    this.uiUtilSrv.navigateHabitListPage();
  }
}
