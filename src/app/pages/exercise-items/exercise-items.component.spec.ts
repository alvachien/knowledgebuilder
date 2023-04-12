import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { ExerciseItemsComponent } from './exercise-items.component';
import { InvitedUser } from 'src/app/models';
import { SafeAny } from 'src/app/common';
import { Router } from '@angular/router';

describe('ExerciseItemsComponent', () => {
  let component: ExerciseItemsComponent;
  let fixture: ComponentFixture<ExerciseItemsComponent>;
  let odataSvc: SafeAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getUserCollectionsSpy: SafeAny;
  let getExerciseItemsSpy: SafeAny;
  let deleteExerciseItemSpy: SafeAny;
  let userDetail: InvitedUser;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['getUserCollections', 'getExerciseItems', 'deleteExerciseItem']);

    getUserCollectionsSpy = odataSvc.getUserCollections.and.returnValue(of({}));
    getExerciseItemsSpy = odataSvc.getExerciseItems.and.returnValue(of({}));
    deleteExerciseItemSpy = odataSvc.deleteExerciseItem.and.returnValue(of(false));
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
      declarations: [ExerciseItemsComponent],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: ODataService, useValue: odataSvc },
        UIUtilityService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseItemsComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {
      getExerciseItemsSpy.and.returnValue(asyncData({
        totalCount: 0,
        items: []
      }));
      deleteExerciseItemSpy.and.returnValue(asyncData(false));
      getUserCollectionsSpy.and.returnValue(asyncData({
        totalCount: 0,
        items: []
      }));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
    }));

    it('refresh without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.onRefreshList();
      expect(component).toBeTruthy();

      component.resetPaging();
      expect(component).toBeTruthy();
    }));
  });

  describe('test navigation', () => {
    it('onGoToSearch', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onGoToSearch();

      expect(routerstub.navigate).toHaveBeenCalled();
    });
    it('onDisplayItem', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onDisplayItem(1);

      expect(routerstub.navigate).toHaveBeenCalled();
    });
    it('onChangeItem', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onChangeItem(1);

      expect(routerstub.navigate).toHaveBeenCalled();
    });
  });
});
