import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { of } from 'rxjs';
import { ODataService, UIUtilityService } from 'src/app/services';

import { getTranslocoModule } from 'src/testing';
import { MaterialModulesModule } from 'src/app/material-modules';
import { PrintableQuizComponent } from './printable-quiz.component';
import { PrintableQuizSectionComponent } from '../printable-quiz-section';
import { PrintableQuizSectionItemComponent } from '../printable-quiz-section-item';

describe('PrintableQuizComponent', () => {
  let component: PrintableQuizComponent;
  let fixture: ComponentFixture<PrintableQuizComponent>;

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
      declarations: [
        PrintableQuizComponent,
        PrintableQuizSectionComponent,
        PrintableQuizSectionItemComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintableQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('standard scenario', () => {
    it('step 1. default is empty', () => {
      expect(component.arAddQuizFinal.length).toEqual(0);
      expect(component.arSubQuizFinal.length).toEqual(0);
      expect(component.arMulQuizFinal.length).toEqual(0);
      expect(component.arMixOpQuizFinal.length).toEqual(0);
      expect(component.arFractQuizFinal.length).toEqual(0);
    });

    it('step 1. valid input and go to step 2', fakeAsync(() => {
      component.contentFormGroup.get('amountAddCtrl')?.setValue(10);
      component.contentFormGroup.get('numberBeginCtrl')?.setValue(1);
      component.contentFormGroup.get('numberEndCtrl')?.setValue(100);

      fixture.detectChanges();
      tick();

      component.stepper.next();
      tick();

      expect(component.arAddQuizFinal.length).toEqual(0);
      expect(component.arSubQuizFinal.length).toEqual(0);
      expect(component.arMulQuizFinal.length).toEqual(0);
      expect(component.arMixOpQuizFinal.length).toEqual(0);
      expect(component.arFractQuizFinal.length).toEqual(0);

      component.onReset();
    }));

    it('step 2. valid input and go to step 3', fakeAsync(() => {
      component.contentFormGroup.get('amountAddCtrl')?.setValue(10);
      component.contentFormGroup.get('numberBeginCtrl')?.setValue(1);
      component.contentFormGroup.get('numberEndCtrl')?.setValue(100);

      fixture.detectChanges();
      tick();

      component.stepper.next();
      tick();

      component.quizFormGroup.get('fontSizeCtrl')?.setValue(15);
      component.quizFormGroup.get('amountOfCopyCtrl')?.setValue(1);
      component.stepper.next();
      tick();

      expect(component.arAddQuizFinal.length).toEqual(4);
      expect(component.arSubQuizFinal.length).toEqual(0);
      expect(component.arMulQuizFinal.length).toEqual(0);
      expect(component.arMixOpQuizFinal.length).toEqual(0);
      expect(component.arFractQuizFinal.length).toEqual(0);

      component.onReset();
    }));
  });
});
