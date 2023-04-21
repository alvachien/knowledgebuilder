import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { HabitPointsListComponent } from './habit-points-list.component';
import { AwardUserView, InvitedUser } from 'src/app/models';
import { SafeAny } from 'src/app/common';

describe('HabitPointsListComponent', () => {
  let component: HabitPointsListComponent;
  let fixture: ComponentFixture<HabitPointsListComponent>;
  let odataSvc: SafeAny;
  let getHabitOpeningPointsByUserDateSpy: SafeAny;
  let getHabitPointsByUserDateReportSpy: SafeAny;
  let getUserOpeningPointReportSpy: SafeAny;
  let getUserHabitPointReportsSpy: SafeAny;
  let deleteHabitPointSpy: SafeAny;
  let userDetail: InvitedUser;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', [
      'getHabitOpeningPointsByUserDate',
      'getHabitPointsByUserDateReport',
      'getUserOpeningPointReport',
      'getUserHabitPointReports',
      'deleteHabitPoint',
    ]);

    getHabitOpeningPointsByUserDateSpy = odataSvc.getHabitOpeningPointsByUserDate.and.returnValue(of(0));
    getHabitPointsByUserDateReportSpy = odataSvc.getHabitPointsByUserDateReport.and.returnValue(of([]));
    getUserOpeningPointReportSpy = odataSvc.getUserOpeningPointReport.and.returnValue(of(0));
    getUserHabitPointReportsSpy = odataSvc.getUserHabitPointReports.and.returnValue(of([]));
    deleteHabitPointSpy = odataSvc.deleteHabitPoint.and.returnValue(of(false));
  });

  beforeEach(async () => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    let auv: AwardUserView[] = [];
    let au: AwardUserView = new AwardUserView();
    au.userName = 'test1';
    au.displayAs = 'Test 1';
    au.targetUser = 'test1_id';
    auv.push(au);
    userDetail.awardUsers = auv;
    const authStub: Partial<AuthService> = {
      userDetail: userDetail,
    };

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
      declarations: [HabitPointsListComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: ODataService, useValue: odataSvc },
        UIUtilityService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitPointsListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {
      getHabitOpeningPointsByUserDateSpy = odataSvc.getHabitOpeningPointsByUserDate.and.returnValue(asyncData(0));
      getHabitPointsByUserDateReportSpy = odataSvc.getHabitPointsByUserDateReport.and.returnValue(asyncData([]));
      getUserOpeningPointReportSpy = odataSvc.getUserOpeningPointReport.and.returnValue(asyncData(0));
      getUserHabitPointReportsSpy = odataSvc.getUserHabitPointReports.and.returnValue(asyncData([]));
      deleteHabitPointSpy = odataSvc.deleteHabitPoint.and.returnValue(asyncData(false));      
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
    }));

    it('refresh data', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.selectedUser = 'test1_id';
      component.selectedPeriod = '1';
      component.onReportParameterSelectionChange('event');
      
      component.onHideManualPoints();
      component.onHideHabitPoints();

      component.onDeleteManualPoint(1);
      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));
  });
});
