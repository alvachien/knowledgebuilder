import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { HabitRecordCreateComponent } from './habit-record-create.component';
import { InvitedUser } from 'src/app/models';

describe('HabitRecordCreateComponent', () => {
  let component: HabitRecordCreateComponent;
  let fixture: ComponentFixture<HabitRecordCreateComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataSvc: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getOverviewInfoSpy: any;
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
});
