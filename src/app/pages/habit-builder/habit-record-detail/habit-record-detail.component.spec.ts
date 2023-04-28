import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRouteUrlStub, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';

import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { HabitRecordDetailComponent } from './habit-record-detail.component';
import { InvitedUser, UserHabitRecordView } from 'src/app/models';
import { SafeAny } from 'src/app/common';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { UIMode } from 'actslib';

describe('HabitRecordDetailComponent', () => {
  let component: HabitRecordDetailComponent;
  let fixture: ComponentFixture<HabitRecordDetailComponent>;
  let userDetail: InvitedUser;
  let activatedRouteStub: ActivatedRouteUrlStub;

  beforeAll(() => {
  });

  beforeEach(async () => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
    const authStub: Partial<AuthService> = {
      userDetail: userDetail,
    };
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

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
      declarations: [HabitRecordDetailComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        UIUtilityService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitRecordDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('record', {}), new UrlSegment('display', {})] as UrlSegment[]);

      let uisrv = TestBed.inject(UIUtilityService);
      let record = new UserHabitRecordView();
      record.habitID = 22;
      record.completeFact = 2;
      record.ruleID = 12;
      record.ruleDaysFrom = 3;
      record.ruleDaysTo = 5;
      record.rulePoint = 20;

      uisrv.currentUserHabitRecord = record;
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Display);
      expect(component.isUpdateMode).toBeFalse();
      expect(component.isDisplayMode).toBeTrue();
      expect(component.isCreateMode).toBeFalse();

      tick();
      fixture.detectChanges();
      flush();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('edit mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('record', {}), new UrlSegment('edit', {})] as UrlSegment[]);

      let uisrv = TestBed.inject(UIUtilityService);
      let record = new UserHabitRecordView();
      record.habitID = 22;
      record.completeFact = 2;
      record.ruleID = 12;
      record.ruleDaysFrom = 3;
      record.ruleDaysTo = 5;
      record.rulePoint = 20;

      uisrv.currentUserHabitRecord = record;
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Update);
      expect(component.isUpdateMode).toBeTrue();
      expect(component.isDisplayMode).toBeFalse();      

      tick();
      fixture.detectChanges();
      flush();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('navigation shall work', () => {
    it('navigation to list shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
    
      component.onReturnToList();
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));
  });
});
