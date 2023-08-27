import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  discardPeriodicTasks,
  flush,
  inject,
} from '@angular/core/testing';
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
import { ExerciseItemAddToCollDialog } from './exercise-items-add-coll-dlg.component';
import { ExerciseItemNewPracticeDialog } from './exercise-items-newpractice-dlg.component';
import { OverlayContainer } from '@angular/cdk/overlay';

describe('ExerciseItemsComponent', () => {
  let component: ExerciseItemsComponent;
  let fixture: ComponentFixture<ExerciseItemsComponent>;
  let odataSvc: SafeAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getUserCollectionsSpy: SafeAny;
  let getExerciseItemsSpy: SafeAny;
  let deleteExerciseItemSpy: SafeAny;
  let createExerciseItemUserScoreSpy: SafeAny;
  let userDetail: InvitedUser;
  const ElementClass_DialogCloseButton = '.ant-modal-close';
  const ElementClass_DialogCancelButton = '.ant-modal-cancel';
  const ElementClass_DialogContent = '.ant-modal-body';

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', [
      'getUserCollections',
      'getExerciseItems',
      'deleteExerciseItem',
      'createExerciseItemUserScore',
    ]);

    getUserCollectionsSpy = odataSvc.getUserCollections.and.returnValue(of({}));
    getExerciseItemsSpy = odataSvc.getExerciseItems.and.returnValue(of({}));
    deleteExerciseItemSpy = odataSvc.deleteExerciseItem.and.returnValue(of(false));
    createExerciseItemUserScoreSpy = odataSvc.createExerciseItemUserScore.and.returnValue(of({}));
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
      declarations: [ExerciseItemsComponent, ExerciseItemAddToCollDialog, ExerciseItemNewPracticeDialog],
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
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      getExerciseItemsSpy.and.returnValue(
        asyncData({
          totalCount: 0,
          items: [],
        })
      );
      deleteExerciseItemSpy.and.returnValue(asyncData(false));
      getUserCollectionsSpy.and.returnValue(
        asyncData({
          totalCount: 0,
          items: [],
        })
      );
    });
    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      discardPeriodicTasks();
      flush();
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

      discardPeriodicTasks();
      flush();
    }));

    xit('Add to collection', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // component.onAddToCollection(12);
      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));

    xit('New practice', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onNewPractice(12);
      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCancelButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('test navigation', () => {
    it('onGoToPreview', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onGoToPreview();

      expect(routerstub.navigate).toHaveBeenCalled();
    });

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
