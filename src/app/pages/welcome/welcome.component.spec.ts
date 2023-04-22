import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { WelcomeComponent } from './welcome.component';
import { MaterialModulesModule } from 'src/app/material-modules';
import { ODataService } from 'src/app/services';
import { of } from 'rxjs';
import { SafeAny } from 'src/app/common';
import { TagReferenceType } from 'src/app/models';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;
  let odataSvc: SafeAny;
  let getOverviewInfoSpy: SafeAny;
  let getMetadataSpy: SafeAny;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['getOverviewInfo', 'getMetadata']);

    getOverviewInfoSpy = odataSvc.getOverviewInfo.and.returnValue(of(''));
    getMetadataSpy = odataSvc.getMetadata.and.returnValue(of(''));
  });

  beforeEach(waitForAsync(() => {
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
      declarations: [WelcomeComponent],
      providers: [{ provide: ODataService, useValue: odataSvc }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {
      getMetadataSpy.and.returnValue(asyncData('<xml></xml>'));
      getOverviewInfoSpy.and.returnValue(asyncData([
        {
          RefType: TagReferenceType.KnowledgeItem,
          Count: 12
        }, {
          RefType: TagReferenceType.ExerciseItem,
          Count: 34,
        }
      ]));
    });

    it('init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.countOfKnowledge).toEqual(12);

      discardPeriodicTasks();
      flush();
    }));

    it('init without error 2, for random', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.countOfKnowledge).toEqual(12);

      discardPeriodicTasks();
      flush();
    }));

    it('init without error 3, for random', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.countOfKnowledge).toEqual(12);
      
      discardPeriodicTasks();
      flush();
    }));
  });
});
