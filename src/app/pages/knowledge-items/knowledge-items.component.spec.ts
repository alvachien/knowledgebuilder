import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { Router } from '@angular/router';

import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { KnowledgeItemsComponent } from './knowledge-items.component';
import { InvitedUser } from 'src/app/models';
import { SafeAny } from 'src/app/common';
import { KnowledgeItemAddToCollDialog } from './knowledge-items-add-coll-dlg.component';

describe('KnowledgeItemsComponent', () => {
  let component: KnowledgeItemsComponent;
  let fixture: ComponentFixture<KnowledgeItemsComponent>;
  let odataservice: SafeAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getKnowledgeItemsSpy: SafeAny;
  let deleteExerciseItemSpy: SafeAny;
  let getUserCollectionsSpy: SafeAny;
  let addKnowledgeItemToCollectionSpy: SafeAny;
  let userDetail: InvitedUser;

  beforeAll(() => {
    odataservice = jasmine.createSpyObj('ODataService', [
      'getKnowledgeItems',
      'deleteExerciseItem',
      'getUserCollections',
      'addKnowledgeItemToCollection',
    ]);
    getKnowledgeItemsSpy = odataservice.getKnowledgeItems.and.returnValue(of({
      totalCount: 0,
      items: []
    }));
    deleteExerciseItemSpy = odataservice.deleteExerciseItem.and.returnValue(of(false));
    getUserCollectionsSpy = odataservice.getUserCollections.and.returnValue(of({
      totalCount: 0,
      items: []
    }));
    addKnowledgeItemToCollectionSpy = odataservice.addKnowledgeItemToCollection.and.returnValue(of([]));
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
      declarations: [
        KnowledgeItemsComponent,
        KnowledgeItemAddToCollDialog
      ],
      providers: [
        UIUtilityService,
        { provide: AuthService, useValue: authStub },
        { provide: ODataService, useValue: odataservice },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeItemsComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {
      getKnowledgeItemsSpy.and.returnValue(asyncData({
        totalCount: 0,
        items: []
      }));
      deleteExerciseItemSpy.and.returnValue(asyncData(false));
      getUserCollectionsSpy.and.returnValue(asyncData({
        totalCount: 0,
        items: []
      }));
      addKnowledgeItemToCollectionSpy.and.returnValue(of([]));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      component.onRefreshList();
      component.resetPaging();

      //component.onAddToCollection(1);

      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));

    it('navigation to search shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
    
      component.onGoToSearch();
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));

    it('navigation to preview shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
    
      component.onGoToPreview();
      expect(routerstub.navigate).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));
  });
});
