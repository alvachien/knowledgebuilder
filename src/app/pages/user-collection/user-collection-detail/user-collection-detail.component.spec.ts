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

import { UserCollectionDetailComponent } from './user-collection-detail.component';
import { InvitedUser } from 'src/app/models';

describe('UserCollectionDetailComponent', () => {
  let component: UserCollectionDetailComponent;
  let fixture: ComponentFixture<UserCollectionDetailComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataservice: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readUserCollectionSpy: any;
  let userDetail: InvitedUser;

  beforeAll(() => {
    odataservice = jasmine.createSpyObj('ODataService', ['readUserCollection']);
    readUserCollectionSpy = odataservice.readUserCollection.and.returnValue(of({}));
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
      declarations: [UserCollectionDetailComponent],
      providers: [
        UIUtilityService,
        { provide: AuthService, useValue: authStub },
        { provide: ODataService, useValue: odataservice },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCollectionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
