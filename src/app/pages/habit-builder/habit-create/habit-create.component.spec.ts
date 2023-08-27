import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { HabitCreateComponent } from './habit-create.component';
import { HabitCompleteCategory, HabitFrequency, InvitedUser } from 'src/app/models';
import { SafeAny } from 'src/app/common';

describe('HabitCreateComponent', () => {
  let component: HabitCreateComponent;
  let fixture: ComponentFixture<HabitCreateComponent>;
  let odataSvc: SafeAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getOverviewInfoSpy: SafeAny;
  let userDetail: InvitedUser;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['getOverviewInfo']);

    getOverviewInfoSpy = odataSvc.getOverviewInfo.and.returnValue(of(''));
  });

  beforeEach(async () => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
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
      declarations: [HabitCreateComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: ODataService, useValue: odataSvc },
        UIUtilityService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitCreateComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {});

    it('shall initialize', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      component.firstFormGroup.get('freqCtrl')?.setValue(HabitFrequency.Monthly);
      tick();
      fixture.detectChanges();

      component.firstFormGroup.get('compCtgyCtrl')?.setValue(HabitCompleteCategory.NumberOfCount);
      tick();
      fixture.detectChanges();

      component.firstFormGroup.get('freqCtrl')?.setValue(HabitFrequency.Daily);
      tick();
      fixture.detectChanges();

      component.secondFormGroup.get('rawCtrl')?.setValue('3;4;6');
      tick();
      fixture.detectChanges();

      component.onInitialRules();
    }));
  });
});
