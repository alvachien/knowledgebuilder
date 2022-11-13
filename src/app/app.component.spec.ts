import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { AppComponent } from './app.component';
import { AuthService, ODataService, UIUtilityService } from './services';
import { MaterialModulesModule } from './material-modules';
import { AppUIModule } from './app-ui.module';
import { NavItemFilterPipe } from './pipes';
import { InvitedUser } from './models';

describe('AppComponent', () => {
  let odataervice: any;
  let userDetail: InvitedUser;

  beforeAll(() => {
    odataervice = jasmine.createSpyObj('ODataService', [
      'searchExerciseItems',
    ]);
  });

  beforeEach(waitForAsync(() => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
    const authStub: Partial<AuthService> = {
      userDetail: userDetail
    };

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        MaterialModulesModule,
        AppUIModule,
        getTranslocoModule(),
      ],
      declarations: [
        NavItemFilterPipe,
        AppComponent
      ],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: ODataService, useValue: odataervice },
        UIUtilityService,
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
