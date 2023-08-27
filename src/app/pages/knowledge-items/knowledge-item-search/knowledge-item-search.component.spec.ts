import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { asyncData, getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { ODataService, UIUtilityService } from 'src/app/services';
import { KnowledgeItemSearchComponent } from './knowledge-item-search.component';
import { AppUIModule } from 'src/app/app-ui.module';
import { SafeAny } from 'src/app/common';
import { Router } from '@angular/router';
import { KnowledgeItem } from 'src/app/models';

describe('KnowledgeItemSearchComponent', () => {
  let component: KnowledgeItemSearchComponent;
  let fixture: ComponentFixture<KnowledgeItemSearchComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataSvc: SafeAny;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let getKnowledgeItemsSpy: SafeAny;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['getKnowledgeItems']);

    getKnowledgeItemsSpy = odataSvc.getKnowledgeItems.and.returnValue(of(''));
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        MaterialModulesModule,
        BrowserDynamicTestingModule,
        AppUIModule,
        getTranslocoModule(),
      ],
      declarations: [KnowledgeItemSearchComponent],
      providers: [{ provide: ODataService, useValue: odataSvc }, UIUtilityService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeItemSearchComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('work with data', () => {
    beforeEach(() => {
      getKnowledgeItemsSpy.and.returnValue(
        asyncData({
          totalCount: 1,
          items: [new KnowledgeItem()],
        })
      );
    });

    it('shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onAddFilter();
      component.onRemoveFilter(0);

      const fltr = component.filters[0];
      fltr.fieldName = 'Title';
      component.onFieldSelectionChanged(fltr);

      component.onSearch();
      tick();
      fixture.detectChanges();

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('test navigation', () => {
    it('onDisplayItem', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onDisplayItem(12);

      expect(routerstub.navigate).toHaveBeenCalled();
    });

    it('onGoToPreview', () => {
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      component.onGoToPreview();

      expect(routerstub.navigate).toHaveBeenCalled();
    });
  });
});
