import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import moment from 'moment';

import { AwardRule, AwardRuleTypeEnum, getAwardRuleTypeNames } from 'src/app/models';
import { ODataService } from 'src/app/services';

class DimensionInfo {
  from: number = 0;
  to: number = 0;

  public toString(): string {
    return `[${this.from} - ${this.to})`;
  }
}

class ContinuedDaysInfo {
  from: number = 0;
  to: number = 0;
  public toString(): string {
    return `[${this.from} - ${this.to})`;
  }
}

@Component({
  selector: 'app-award-rule-generation',
  templateUrl: './award-rule-generation.component.html',
  styleUrls: ['./award-rule-generation.component.scss']
})
export class AwardRuleGenerationComponent implements OnInit {
  // eslint-disable-next-line @angular-eslint/component-class-suffix
  displayedColumns: string[] = ['dimension', 'point', 'edit'];
  dataSource: AwardRule[] = [];
  dataSchema: { [key: string]: any } = {
    point: 'number',
    edit: 'edit',
  };
  step = 0;
  arRuleTypes: any[] = [];
  selectedRuleType: AwardRuleTypeEnum = AwardRuleTypeEnum.GoToBedTime;
  targetUser = '';
  desp = '';
  validFrom: moment.Moment = moment();
  validTo: moment.Moment = moment();
  rawDimension = '';
  rawContDay = '';
  dimensions: DimensionInfo[] = [];
  contDays: ContinuedDaysInfo[] = [];
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder,
    private odataSrv: ODataService) {
    this.arRuleTypes = getAwardRuleTypeNames();

    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
  }

  get isExpertMode(): boolean {
    return this.odataSrv.expertMode;
  }

  public ngOnInit(): void {
    // Todo.
  }

  setStep(index: number) {
    this.step = index;
  }
  nextStep() {
    this.step++;
  }
  prevStep() {
    this.step--;
  }

  public onDimensionChange(event: any) {
    this.dimensions = [];

    if (this.rawDimension) {
      const subd = this.rawDimension.split(';');
      switch(this.selectedRuleType) {
        case AwardRuleTypeEnum.BodyExerciseCount:
          break;

        case AwardRuleTypeEnum.GoToBedTime:
        default: {
          let submap = subd.map(v => {
            if (v) {
              const tp = +v;
              if (!isNaN(tp)) {
                if (tp <= 23.99 && tp > 0) {
                  return tp;
                }
              }
            }
            return 0;
          });
          submap = submap.filter(v => v > 0);
          submap.sort();
          let tpcur = 0;
          submap.forEach(sd => { 
            let di = new DimensionInfo();
            di.from = tpcur;
            di.to = sd;
            this.dimensions.push(di);
            tpcur = sd;
          });
          let di2 = new DimensionInfo();
          di2.from = tpcur;
          di2.to = 24;
          this.dimensions.push(di2);
          break;
        }
      }
    }
  }
  public onContDayChange(event: any) {
    this.contDays = [];

    if (this.rawContDay) {
      const subd = this.rawContDay.split(';');
      let submap = subd.map(v => {
        if (v) {
          const tp = +v;
          if (!isNaN(tp)) {            
            if (tp > 0) {
              return tp;
            }
          }
        }
        return 0;
      });
      submap = submap.filter(v => v > 0);
      submap.sort();
      let daycur = 0;
      submap.forEach(sd => { 
        let di = new ContinuedDaysInfo();
        di.from = daycur;
        di.to = sd;
        this.contDays.push(di);
        daycur = sd;
      });
      let di2 = new ContinuedDaysInfo();
      di2.from = daycur;
      di2.to = Number.POSITIVE_INFINITY;
      this.contDays.push(di2);
    }
  }
}
