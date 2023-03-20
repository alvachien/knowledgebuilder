import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';
import { ODataService, UIUtilityService } from 'src/app/services';
import { KnowledgeItemSearchComponent } from './knowledge-item-search.component';
import { AppUIModule } from 'src/app/app-ui.module';

describe('KnowledgeItemSearchComponent', () => {
  let component: KnowledgeItemSearchComponent;
  let fixture: ComponentFixture<KnowledgeItemSearchComponent>;
  let odataSvc: any;
  let getOverviewInfoSpy: any;

  beforeAll(() => {
    odataSvc = jasmine.createSpyObj('ODataService', ['getOverviewInfo']);

    getOverviewInfoSpy = odataSvc.getOverviewInfo.and.returnValue(of(''));
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
      providers: [
        { provide: ODataService, useValue: odataSvc },
        UIUtilityService,
      ],
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
});
