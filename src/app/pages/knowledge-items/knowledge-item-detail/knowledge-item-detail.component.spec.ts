import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { MatChipInputEvent } from '@angular/material/chips';

import { ActivatedRouteUrlStub, asyncData, asyncError, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { AuthService, ODataService, UIUtilityService } from 'src/app/services';
import { KnowledgeItemDetailComponent } from './knowledge-item-detail.component';
import { InvitedUser, KnowledgeItem, KnowledgeItemCategory } from 'src/app/models';
import { SafeAny } from 'src/app/common';
import { UIMode } from 'actslib';
import { HttpClient } from '@angular/common/http';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

describe('KnowledgeItemDetailComponent', () => {
  let component: KnowledgeItemDetailComponent;
  let fixture: ComponentFixture<KnowledgeItemDetailComponent>;
  let odataSvc: SafeAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let readKnowledgeItemSpy: SafeAny;
  let createKnowledgeItemSpy: SafeAny;
  let changeKnowledgeItemSpy: SafeAny;
  let userDetail: InvitedUser;
  let activatedRouteStub: ActivatedRouteUrlStub;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', [
      'readKnowledgeItem',
      'createKnowledgeItem',
      'changeKnowledgeItem',
    ]);

    readKnowledgeItemSpy = odataSvc.readKnowledgeItem.and.returnValue(of({}));
    createKnowledgeItemSpy = odataSvc.createKnowledgeItem.and.returnValue(of(''));
    changeKnowledgeItemSpy = odataSvc.changeKnowledgeItem.and.returnValue(of(''));
  });

  beforeEach(waitForAsync(() => {
    userDetail = new InvitedUser();
    userDetail.displayAs = 'test';
    userDetail.awardUsers = [];
    const authStub: Partial<AuthService> = {
      userDetail: userDetail,
      isAuthenticated: true,
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
        NuMonacoEditorModule.forRoot(),
        MarkdownModule.forRoot({
          loader: HttpClient, // optional, only if you use [src] attribute
          markedOptions: {
            provide: MarkedOptions,
            useValue: {
              gfm: true,
              breaks: false,
              pedantic: false,
              smartLists: true,
              smartypants: false,
            },
          },
        }),
        getTranslocoModule(),
      ],
      declarations: [
        KnowledgeItemDetailComponent
      ],
      providers: [
        { provide: AuthService, useValue: authStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: ODataService, useValue: odataSvc },
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

  describe('create mode', () => {
    beforeEach(() => {
      let objtbt = new KnowledgeItem();
      objtbt.ID = 122;
      objtbt.Content = 'aaa';
      objtbt.Title = 'aaa';
      objtbt.ItemCategory = KnowledgeItemCategory.Concept;

      readKnowledgeItemSpy.and.returnValue(asyncData({}));
      createKnowledgeItemSpy.and.returnValue(asyncData(objtbt));
      changeKnowledgeItemSpy.and.returnValue(of(''));
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

      // Error
      component.onOK();

      component.itemFormGroup.get('ctgyControl')?.setValue(KnowledgeItemCategory.Concept);
      component.itemFormGroup.get('titleControl')?.setValue('test');
      component.content = 'test';

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
      component.onOK();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('display mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);
  
      let objtbt = new KnowledgeItem();
      objtbt.ID = 122;
      objtbt.Content = 'aaa';
      objtbt.Title = 'aaa';
      objtbt.ItemCategory = KnowledgeItemCategory.Concept;
  
      readKnowledgeItemSpy.and.returnValue(asyncData(objtbt));
      createKnowledgeItemSpy.and.returnValue(of(''));
      changeKnowledgeItemSpy.and.returnValue(of(''));
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

      tick();
      fixture.detectChanges();
      flush();

      //expect(readKnowledgeItemSpy).toHaveBeenCalled();

      discardPeriodicTasks();
      flush();
    }));

    it('handle error', fakeAsync(() => {
      readKnowledgeItemSpy.and.returnValue(asyncError<string>('read order failed'));

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

      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('edit mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);
  
      let objtbt = new KnowledgeItem();
      objtbt.ID = 122;
      objtbt.Content = 'aaa';
      objtbt.Title = 'aaa';
      objtbt.ItemCategory = KnowledgeItemCategory.Concept;
  
      readKnowledgeItemSpy.and.returnValue(asyncData(objtbt));
      createKnowledgeItemSpy.and.returnValue(of(''));
      changeKnowledgeItemSpy.and.returnValue(asyncData(objtbt));
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

      tick();
      fixture.detectChanges();
      flush();

      expect(readKnowledgeItemSpy).toHaveBeenCalled();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
      component.onOK();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('navigation shall work', () => {
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

    it('navigation to new create page shall work', fakeAsync(() => {
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
