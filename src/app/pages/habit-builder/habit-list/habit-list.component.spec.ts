import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';

import { HabitListComponent } from './habit-list.component';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { InvitedUser } from 'src/app/models';
import { SafeAny } from 'src/app/common';

describe('HabitListComponent', () => {
  let component: HabitListComponent;
  let fixture: ComponentFixture<HabitListComponent>;
  let odataservice: SafeAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getUserHabitsSpy: SafeAny;
  let userDetail: InvitedUser;

  beforeAll(() => {
    odataservice = jasmine.createSpyObj('ODataService', ['getUserHabits']);
    getUserHabitsSpy = odataservice.getUserHabits.and.returnValue(
      of({
        totalCount: 0,
        items: [],
      })
    );
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
      declarations: [HabitListComponent],
      providers: [
        UIUtilityService,
        { provide: AuthService, useValue: authStub },
        { provide: ODataService, useValue: odataservice },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabitListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
