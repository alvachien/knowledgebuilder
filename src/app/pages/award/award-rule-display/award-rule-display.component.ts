import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UIUtilityService, ODataService, } from 'src/app/services';
import { AwardRuleDetail, AwardRuleTypeEnum, AwardUserView, getAwardRuleTypeNames } from 'src/app/models';

@Component({
  selector: 'app-award-rule-display',
  templateUrl: './award-rule-display.component.html',
  styleUrls: ['./award-rule-display.component.scss'],
})
export class AwardRuleDisplayComponent implements OnInit, OnDestroy {
  private destroyed$?: ReplaySubject<boolean>;
  private routerID = -1;
  headerFormGroup: FormGroup;
  arRuleTypes: any[] = [];
  dataSource: AwardRuleDetail[] = [];
  // displayedColumns = ['id', 'count', 'done', 'time', 'days', 'point'];
  displayedColumns: string[] = [];

  constructor(private activateRoute: ActivatedRoute,
    private uiUtilSrv: UIUtilityService,
    private odataSrv: ODataService,
    private formBuilder: FormBuilder,) {
    this.arRuleTypes = getAwardRuleTypeNames();
    this.headerFormGroup = this.formBuilder.group({
      targetuserCtrl: ['', Validators.required],
      validFromCtrl: [undefined, Validators.required],
      validToCtrl: [undefined, Validators.required],
      ruleTypeCtrl: [AwardRuleTypeEnum.GoToBedTime, Validators.required],
      despCtrl: ['', Validators.required],
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

  get isExpertMode(): boolean {
    return this.odataSrv.isLoggedin;
  }

  ngOnInit(): void {
    this.destroyed$ = new ReplaySubject(1);
    // this.odataSrv.getAwardUserViews().subscribe();

    this.activateRoute.url.subscribe({
      next: val => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'rule-group-display') {
            this.routerID = +val[1].path;
          }
        }

        if (this.routerID !== -1) {
          this.odataSrv.readAwardRuleGroup(this.routerID).subscribe({
            next: valGrp => {
              // Show the result
              this.headerFormGroup.get('targetuserCtrl')?.setValue(valGrp.targetUser);
              this.headerFormGroup.get('despCtrl')?.setValue(valGrp.desp);
              this.headerFormGroup.get('validFromCtrl')?.setValue(valGrp.validFrom);
              this.headerFormGroup.get('validToCtrl')?.setValue(valGrp.validTo);
              this.headerFormGroup.get('ruleTypeCtrl')?.setValue(valGrp.ruleType);
              this.headerFormGroup.disable();
              switch(valGrp.ruleType) {
                case AwardRuleTypeEnum.BodyExerciseCount:
                case AwardRuleTypeEnum.HomeWorkCount:
                case AwardRuleTypeEnum.HouseKeepingCount:
                case AwardRuleTypeEnum.PoliteBehavior: {
                  this.displayedColumns = ['id', 'count', 'days', 'point'];
                  break;
                }

                case AwardRuleTypeEnum.HandWritingHabit:
                case AwardRuleTypeEnum.CleanDeakHabit:
                case AwardRuleTypeEnum.ErrorCollectionHabit: {
                  this.displayedColumns = ['id', 'done', 'days', 'point'];
                  break;
                }

                case AwardRuleTypeEnum.GoToBedTime:
                case AwardRuleTypeEnum.SchoolWorkTime:
                  default: {
                    this.displayedColumns = ['id', 'time', 'days', 'point'];
                    break;
                  }
              }
              this.dataSource = valGrp.rules.slice();
            },
            error: err => {
              this.uiUtilSrv.showSnackInfo(err);
            }
          });
        }
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.destroyed$) {
      this.destroyed$.complete();
      this.destroyed$ = undefined;
    }
  }
  public onReturnToList(): void {
    this.uiUtilSrv.navigateAwardRuleGroupListPage();
  }
  public onCreateNewOne(): void {
    this.uiUtilSrv.navigateAwardRuleGenerationPage();
  }
}
