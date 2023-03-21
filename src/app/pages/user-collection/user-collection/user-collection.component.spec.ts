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

import { UserCollectionComponent } from './user-collection.component';

describe('UserCollectionComponent', () => {
  let component: UserCollectionComponent;
  let fixture: ComponentFixture<UserCollectionComponent>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let odataservice: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let getUserCollectionsSpy: any;

  beforeAll(() => {
    odataservice = jasmine.createSpyObj('ODataService', ['getUserCollections']);
    getUserCollectionsSpy = odataservice.getUserCollections.and.returnValue(of({}));
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
        getTranslocoModule(),
      ],
      declarations: [UserCollectionComponent],
      providers: [UIUtilityService, { provide: ODataService, useValue: odataservice }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCollectionComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
