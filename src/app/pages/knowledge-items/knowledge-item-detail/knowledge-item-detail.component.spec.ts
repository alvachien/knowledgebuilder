import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { of } from 'rxjs';

import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { KnowledgeItemDetailComponent } from './knowledge-item-detail.component';
import { InvitedUser } from 'src/app/models';

describe('KnowledgeItemDetailComponent', () => {
  let component: KnowledgeItemDetailComponent;
  let fixture: ComponentFixture<KnowledgeItemDetailComponent>;
  let odataSvc: any;
  let readKnowledgeItemSpy: any;
  let userDetail: InvitedUser;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['readKnowledgeItem']);

    readKnowledgeItemSpy = odataSvc.readKnowledgeItem.and.returnValue(of(''));
  });

  beforeEach(waitForAsync(() => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
    const authStub: Partial<AuthService> = {
      userDetail: userDetail,
      isAuthenticated: true,
    };

    TestBed.configureTestingModule({
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
      declarations: [KnowledgeItemDetailComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provoide: ODataService, useValue: odataSvc },
        UIUtilityService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeItemDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
