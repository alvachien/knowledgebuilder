import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';

import { AwardUserView, UserHabit, UserHabitRecord } from 'src/app/models';
import { ODataService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-habit-record-create',
  templateUrl: './habit-record-create.component.html',
  styleUrls: ['./habit-record-create.component.scss'],
})
export class HabitRecordCreateComponent implements OnInit {
  currentObject: UserHabitRecord | null = null;
  firstFormGroup: FormGroup;

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

  ngOnInit(): void {
  }

}
