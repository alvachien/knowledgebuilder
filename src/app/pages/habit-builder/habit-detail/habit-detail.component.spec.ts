import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRouteUrlStub, asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { HabitDetailComponent } from './habit-detail.component';
import { HabitCategory, HabitCompleteCategory, HabitFrequency, InvitedUser, UserHabit } from 'src/app/models';
import { SafeAny } from 'src/app/common';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import moment from 'moment';
import { UIMode } from 'actslib';

describe('HabitDetailComponent', () => {
  let component: HabitDetailComponent;
  let fixture: ComponentFixture<HabitDetailComponent>;
  let odataSvc: SafeAny;
  let readUserHabitSpy: SafeAny;
  let userDetail: InvitedUser;
  let activatedRouteStub: ActivatedRouteUrlStub;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['readUserHabit']);

    readUserHabitSpy = odataSvc.readUserHabit.and.returnValue(of(''));
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
      declarations: [HabitDetailComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ODataService, useValue: odataSvc },
        UIUtilityService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      const testobj: UserHabit = new UserHabit();
      testobj.ID = 1;
      testobj.category = HabitCategory.Positive;
      testobj.comment = 'test';
      testobj.completeCategory = HabitCompleteCategory.NumberOfTimes;
      testobj.completeCondition = 4;
      testobj.frequency = HabitFrequency.Weekly;
      testobj.targetUser = 'tester';
      testobj.startDate = 1; // Monday
      testobj.validFrom = moment('2021-01-01');
      testobj.validTo = moment('2022-01-01');

      readUserHabitSpy.and.returnValue(asyncData(testobj));
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

      tick();
      fixture.detectChanges();
      flush();

      //expect(readKnowledgeItemSpy).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('edit mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);

      const testobj: UserHabit = new UserHabit();
      testobj.ID = 1;
      testobj.category = HabitCategory.Positive;
      testobj.comment = 'test';
      testobj.completeCategory = HabitCompleteCategory.NumberOfTimes;
      testobj.completeCondition = 4;
      testobj.frequency = HabitFrequency.Weekly;
      testobj.targetUser = 'tester';
      testobj.startDate = 1; // Monday
      testobj.validFrom = moment('2021-01-01');
      testobj.validTo = moment('2022-01-01');
      readUserHabitSpy.and.returnValue(asyncData(testobj));
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

      //expect(readKnowledgeItemSpy).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));
  });
});
