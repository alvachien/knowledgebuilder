import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import moment from 'moment';

import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { HabitRecordCreateComponent } from './habit-record-create.component';
import { AwardUserView, HabitCompleteCategory, HabitFrequency, InvitedUser } from 'src/app/models';
import { SafeAny } from 'src/app/common';

describe('HabitRecordCreateComponent', () => {
  let component: HabitRecordCreateComponent;
  let fixture: ComponentFixture<HabitRecordCreateComponent>;
  let odataSvc: SafeAny;
  let getUserHabitsSpy: SafeAny;
  let createUserHabitRecordSpy: SafeAny;
  let userDetail: InvitedUser;
  let authStub: Partial<AuthService> = {};

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['getUserHabits', 'createUserHabitRecord']);
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
    const usr1 = new AwardUserView();
    usr1.userName = 'aaa';
    usr1.displayAs = 'AAA';
    userDetail.awardUsers.push(usr1);
    const usr2 = new AwardUserView();
    usr1.userName = 'bbb';
    usr1.displayAs = 'BBB';
    userDetail.awardUsers.push(usr2);

    authStub = {
      userDetail: userDetail,
    };

    getUserHabitsSpy = odataSvc.getUserHabits.and.returnValue(of({}));
    createUserHabitRecordSpy = odataSvc.createUserHabitRecord.and.returnValue(of({}));
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MaterialModulesModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [HabitRecordCreateComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: ODataService, useValue: odataSvc },
        UIUtilityService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitRecordCreateComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {
      getUserHabitsSpy.and.returnValue(
        asyncData({
          totalCount: 0,
          items: [],
        })
      );
      createUserHabitRecordSpy.and.returnValue(asyncData({}));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
    }));
  });

  describe('work with data (multiple lines)', () => {
    beforeEach(() => {
      getUserHabitsSpy.and.returnValue(
        asyncData({
          totalCount: 2,
          items: [
            {
              ID: 1,
              name: 'test1',
              frequency: HabitFrequency.Daily,
              completeCategory: HabitCompleteCategory.NumberOfCount,
            },
            {
              ID: 2,
              name: 'test2',
              frequency: HabitFrequency.Daily,
              completeCategory: HabitCompleteCategory.NumberOfCount,
            },
          ],
        })
      );
      createUserHabitRecordSpy.and.returnValue(asyncData({}));
    });

    it('Check user display', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      component.firstFormGroup.get('targetuserCtrl')?.setValue('aaa');
      component.firstFormGroup.get('dateCtrl')?.setValue(moment());

      tick();
      component.onUserSelected();

      tick();
      fixture.detectChanges();

      const display = component.getUserDisplayAs('aaa');
      expect(display).toEqual('');
    }));

    it('Save the new record', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      component.firstFormGroup.get('targetuserCtrl')?.setValue('aaa');
      component.firstFormGroup.get('dateCtrl')?.setValue(moment());

      tick();
      component.onUserSelected();

      tick();
      fixture.detectChanges();

      const display = component.getUserDisplayAs('aaa');
      expect(display).toEqual('');

      component.onSaveRecord();
      tick();
      fixture.detectChanges();

      flush();
    }));
  });
});
