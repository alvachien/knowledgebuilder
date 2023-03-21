import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { UIMode } from 'actslib';
import moment from 'moment';

import { AwardUserView, UserHabitRecord } from 'src/app/models';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-record-detail',
  templateUrl: './habit-record-detail.component.html',
  styleUrls: ['./habit-record-detail.component.scss'],
})
export class HabitRecordDetailComponent implements OnInit {
  private destroyed$?: ReplaySubject<boolean>;
  uiMode: UIMode = UIMode.Create;
  currentMode = 'Common.Display';
  currentObject: UserHabitRecord | null = null;
  detailFormGroup: UntypedFormGroup;

  constructor(
    private _formBuilder: UntypedFormBuilder,
    private activateRoute: ActivatedRoute,
    private uiUtilSrv: UIUtilityService,
    private authService: AuthService,
    private odataSrv: ODataService
  ) {
    this.detailFormGroup = this._formBuilder.group({
      targetuserCtrl: new UntypedFormControl('', Validators.required),
      habitIDCtrl: new UntypedFormControl(-1),
      dateCtrl: new UntypedFormControl(moment(), Validators.required),
      subIDCtrl: new UntypedFormControl(1, Validators.required),
      compFactCtrl: new UntypedFormControl(1, Validators.required),
      commentCtrl: new UntypedFormControl(''),
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
      const idx = this.authService.userDetail.awardUsers.findIndex(
        (val) => val.targetUser === usrId
      );
      if (idx !== -1) {
        return this.authService.userDetail.awardUsers[idx].displayAs;
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
    this.activateRoute.url.subscribe({
      next: (val) => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'record' && val[1].path === 'display') {
            this.uiMode = UIMode.Display;
            this.currentMode = 'Common.Display';
          } else if (val[0].path === 'record' && val[1].path === 'edit') {
            this.uiMode = UIMode.Update;
            this.currentMode = 'Common.Change';
          }
        }
        if (this.uiUtilSrv.currentUserHabitRecord) {
          this.detailFormGroup
            .get('targetuserCtrl')
            ?.setValue(this.uiUtilSrv.currentUserHabitRecord.targetUser);
          this.detailFormGroup
            .get('habitIDCtrl')
            ?.setValue(this.uiUtilSrv.currentUserHabitRecord.habitID);
          this.detailFormGroup
            .get('dateCtrl')
            ?.setValue(this.uiUtilSrv.currentUserHabitRecord.recordDate);
          this.detailFormGroup
            .get('subIDCtrl')
            ?.setValue(this.uiUtilSrv.currentUserHabitRecord.subID);
          this.detailFormGroup
            .get('compFactCtrl')
            ?.setValue(this.uiUtilSrv.currentUserHabitRecord.completeFact);
          this.detailFormGroup
            .get('commentCtrl')
            ?.setValue(this.uiUtilSrv.currentUserHabitRecord.comment);

          if (this.uiMode === UIMode.Display) {
            this.detailFormGroup.disable();
          } else {
            this.detailFormGroup.enable();
          }
          this.uiUtilSrv.clearHabitRecordDisplay();
        } else {
          this.uiMode = UIMode.Invalid;
          this.detailFormGroup.disable();
        }
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
    });
  }

  public onOK() {
    // OK
  }
  public onReturnToList() {
    this.uiUtilSrv.navigateHabitRecordListPage();
  }
  public onCreateNewOne() {
    this.detailFormGroup.reset();
  }
}
