import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { of } from 'rxjs';

import { ODataService, UIUtilityService } from 'src/app/services';
import { KnowledgeItemsComponent } from './knowledge-items.component';

describe('KnowledgeItemsComponent', () => {
  let component: KnowledgeItemsComponent;
  let fixture: ComponentFixture<KnowledgeItemsComponent>;
  let odataservice: any;
  let getKnowledgeItemsSpy: any;

  beforeAll(() => {
    odataservice = jasmine.createSpyObj('ODataService', [
      'getKnowledgeItems',
    ]);
    getKnowledgeItemsSpy = odataservice.getKnowledgeItems.and.returnValue(of({}));
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
      declarations: [ KnowledgeItemsComponent ],
      providers:[    
        UIUtilityService,
        { provide: ODataService, useValue: odataservice },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgeItemsComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
