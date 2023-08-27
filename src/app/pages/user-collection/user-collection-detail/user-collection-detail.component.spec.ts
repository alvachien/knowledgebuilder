import {
  ComponentFixture,
  TestBed,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRouteUrlStub, asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';

import { UserCollectionDetailComponent } from './user-collection-detail.component';
import { InvitedUser, TagReferenceType, UserCollection, UserCollectionItem } from 'src/app/models';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { UIMode } from 'actslib';

describe('UserCollectionDetailComponent', () => {
  let component: UserCollectionDetailComponent;
  let fixture: ComponentFixture<UserCollectionDetailComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataservice: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  let readUserCollectionSpy: any;
  let createUserCollectionSpy: any;
  let removeExerciseItemFromCollectionSpy: any;
  let removeKnowledgeItemFromCollectionSpy: any;
  let userDetail: InvitedUser;
  let activatedRouteStub: ActivatedRouteUrlStub;

  beforeAll(() => {
    odataservice = jasmine.createSpyObj('ODataService', [
      'readUserCollection',
      'createUserCollection',
      'removeExerciseItemFromCollection',
      'removeKnowledgeItemFromCollection',
    ]);
    readUserCollectionSpy = odataservice.readUserCollection.and.returnValue(of({}));
    createUserCollectionSpy = odataservice.createUserCollection.and.returnValue(of({}));
    removeExerciseItemFromCollectionSpy = odataservice.removeExerciseItemFromCollection.and.returnValue(of({}));
    removeKnowledgeItemFromCollectionSpy = odataservice.removeKnowledgeItemFromCollection.and.returnValue(of({}));
  });

  beforeEach(waitForAsync(() => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
    const authStub: Partial<AuthService> = {
      userDetail: userDetail,
    };

    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

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
      declarations: [UserCollectionDetailComponent],
      providers: [
        UIUtilityService,
        { provide: AuthService, useValue: authStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ODataService, useValue: odataservice },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCollectionDetailComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    beforeEach(() => {
      const objtc = new UserCollection();
      objtc.Comment = 'test';
      objtc.Name = 'test';
      objtc.User = 'test';

      readUserCollectionSpy.and.returnValue(of(''));
      createUserCollectionSpy.and.returnValue(asyncData(objtc));
      removeExerciseItemFromCollectionSpy.and.returnValue(asyncData({}));
      removeKnowledgeItemFromCollectionSpy.and.returnValue(asyncData({}));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Create);
      expect(component.isCreateMode).toBeTrue();
      expect(component.isUpdateMode).toBeFalse();
      expect(component.isDisplayMode).toBeFalse();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
      component.onOK();

      // component.itemFormGroup.get('typeControl')?.setValue(ExerciseItemType.EssayQuestions);
      // component.content = 'test';
      // component.answerContent = 'test';
      // component.onOK();

      discardPeriodicTasks();
      flush();
    }));

    it('delete shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const row = new UserCollectionItem();
      row.RefType = TagReferenceType.ExerciseItem;
      row.RefID = 12;
      component.onDeleteCollItem(row);

      tick();
      fixture.detectChanges();

      row.RefType = TagReferenceType.KnowledgeItem;
      row.RefID = 12;
      component.onDeleteCollItem(row);

      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      const objtc = new UserCollection();
      objtc.Comment = 'test';
      objtc.Name = 'test';
      objtc.User = 'test';

      readUserCollectionSpy.and.returnValue(asyncData(objtc));
      createUserCollectionSpy.and.returnValue(of({}));
      removeExerciseItemFromCollectionSpy.and.returnValue(of({}));
      removeKnowledgeItemFromCollectionSpy.and.returnValue(of({}));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Display);
      expect(component.isCreateMode).toBeFalse();
      expect(component.isUpdateMode).toBeFalse();
      expect(component.isDisplayMode).toBeTrue();
    }));
  });

  describe('edit mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);

      const objtc = new UserCollection();
      objtc.Comment = 'test';
      objtc.Name = 'test';
      objtc.User = 'test';

      readUserCollectionSpy.and.returnValue(asyncData(objtc));
      createUserCollectionSpy.and.returnValue(of({}));
      removeExerciseItemFromCollectionSpy.and.returnValue(of({}));
      removeKnowledgeItemFromCollectionSpy.and.returnValue(of({}));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Update);
      expect(component.isCreateMode).toBeFalse();
      expect(component.isUpdateMode).toBeTrue();
      expect(component.isDisplayMode).toBeFalse();
    }));
  });

  describe('navigation shall work', () => {
    it('navigation display exercise item work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onDisplayExerciseItem(23);
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));

    it('navigation to change exercise item shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onChangeExerciseItem(23);
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));

    it('navigation to list shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onReturnToList();
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));

    it('navigation to create new item shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onCreateNewOne();
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));
  });
});
