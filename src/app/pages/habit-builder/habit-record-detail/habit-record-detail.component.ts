import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UIMode } from 'actslib';
import moment from 'moment';

import { AwardUserView, UserHabit, UserHabitRecord } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-record-detail',
  templateUrl: './habit-record-detail.component.html',
  styleUrls: ['./habit-record-detail.component.scss'],
})
export class HabitRecordDetailComponent implements OnInit {
  uiMode: UIMode = UIMode.Create;
  currentMode: string = 'Common.Create';
  currentObject: UserHabitRecord | null = null;
  detailFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder,
    private uiUtilSrv: UIUtilityService,
    private odataSrv: ODataService) {
      this.detailFormGroup = this._formBuilder.group({
        targetuserCtrl: new FormControl('', Validators.required),
        dateCtrl: new FormControl(moment(), Validators.required),
        subIDCtrl: new FormControl(1, Validators.required),
        compFactCtrl: new FormControl(1, Validators.required),
        commentCtrl: new FormControl('')
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

  public onOK() {

  }
  public onReturnToList() {
    this.uiUtilSrv.navigateHabitRecordListPage();
  }
  public onCreateNewOne() {
    this.detailFormGroup.reset();
  }
}
