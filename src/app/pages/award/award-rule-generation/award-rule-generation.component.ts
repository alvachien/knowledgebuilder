/* eslint-disable no-underscore-dangle */
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import moment from 'moment';

import { AwardRule, AwardRuleTypeEnum, getAwardRuleTypeNames } from 'src/app/models';
import { ODataService } from 'src/app/services';

class DimensionInfo {
  from = 0;
  to = 0;

  public toString(): string {
    return `[${this.from} - ${this.to})`;
  }
}

class ContinuedDaysInfo {
  from = 0;
  to = 0;
  public toString(): string {
    return `[${this.from} - ${this.to})`;
  }
}

class PointInfo {
  dimInfo: DimensionInfo;
  // condInfo: ContinuedDaysInfo;
  points: {index: number; point: number}[] = [];
  isEdit = false;

  public getPoints(col: string): number {
    if (col && col.startsWith('days')) {
      return +col.replace('days', '');
    }
    return -1;
  }
  constructor(dim: DimensionInfo, ) {
    this.dimInfo = dim;
  }
}

@Component({
  selector: 'app-award-rule-generation',
  templateUrl: './award-rule-generation.component.html',
  styleUrls: ['./award-rule-generation.component.scss']
})
export class AwardRuleGenerationComponent implements OnInit {
  // Step 1: HEADER
  firstFormGroup: FormGroup;
  arRuleTypes: any[] = [];
  // Step 2: DIEMENSIONS
  secondFormGroup: FormGroup;
  dimensions: DimensionInfo[] = [];
  // Step 3: DAYS
  thirdFormGroup: FormGroup;
  contDays: ContinuedDaysInfo[] = [];
  // Step 4: POINTS
  displayedColumns: string[] = ['dimension'];
  dataSchema: { [key: string]: any } = {
    point: 'number',
    edit: 'edit',
  };
  dataSource: PointInfo[] = [];
  // Step 5.

  constructor(private _formBuilder: FormBuilder,
    private odataSrv: ODataService) {
    this.arRuleTypes = getAwardRuleTypeNames();

    this.firstFormGroup = this._formBuilder.group({
      targetuserCtrl: ['', Validators.required],
      validFromCtrl: [undefined, Validators.required],
      validToCtrl: [undefined, Validators.required],
      ruleTypeCtrl: [AwardRuleTypeEnum.GoToBedTime, Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      rawCtrl: ['', Validators.required]
    });
    this.thirdFormGroup = this._formBuilder.group({
      rawCtrl: ['', Validators.required]
    });
  }

  get isExpertMode(): boolean {
    return this.odataSrv.expertMode;
  }

  public ngOnInit(): void {
    this.firstFormGroup.get('validFromCtrl')?.setValue(moment());
    this.firstFormGroup.get('validToCtrl')?.setValue(moment());

    this.secondFormGroup.get('rawCtrl')?.valueChanges.subscribe(val => {
      this.onDimensionChange(val);
    });
    this.thirdFormGroup.get('rawCtrl')?.valueChanges.subscribe(val => {
      this.onContDayChange(val);
    });
  }

  get selectedRuleType(): AwardRuleTypeEnum {
    const rtval = this.firstFormGroup.get('ruleTypeCtrl')?.value;
    if (rtval !== undefined) {
      return rtval as AwardRuleTypeEnum;
    }
    return AwardRuleTypeEnum.GoToBedTime;
  }

  public onDimensionChange(val: any) {
    this.dimensions = [];

    if (val) {
      const subd = val.split(';');
      switch(this.selectedRuleType) {
        case AwardRuleTypeEnum.BodyExerciseCount:
          break;

        case AwardRuleTypeEnum.GoToBedTime:
        default: {
          let submap = subd.map((v: string | number) => {
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
          submap = submap.filter((v: number) => v > 0);
          submap.sort();
          let tpcur = 0;
          submap.forEach((sd: number) => {
            const di = new DimensionInfo();
            di.from = tpcur;
            di.to = sd;
            this.dimensions.push(di);
            tpcur = sd;
          });
          const di2 = new DimensionInfo();
          di2.from = tpcur;
          di2.to = 24;
          this.dimensions.push(di2);
          break;
        }
      }
    }
  }
  public onContDayChange(val: any) {
    this.contDays = [];

    if (val) {
      const subd = val.split(';');
      let submap = subd.map((v: string | number) => {
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
      submap = submap.filter((v: number) => v > 0);
      submap.sort();
      let daycur = 0;
      submap.forEach((sd: number) => {
        const di = new ContinuedDaysInfo();
        di.from = daycur;
        di.to = sd;
        this.contDays.push(di);
        daycur = sd;
      });
      const di2 = new ContinuedDaysInfo();
      di2.from = daycur;
      di2.to = Number.POSITIVE_INFINITY;
      this.contDays.push(di2);
    }
  }
  public onInitialRules(): void {
    this.dataSource = [];
    this.displayedColumns = ['dimension'];

    // Columns
    for(let i = 0; i < this.contDays.length; i ++) {
      this.displayedColumns.push(`days${i}`);
    }

    // Initialize data
    this.dimensions.forEach(dim => {
      const pi = new PointInfo(dim);
      for(let i = 0; i < this.contDays.length; i ++) {
        pi.points.push({
          index: i,
          point: 0
        });
      }
      this.dataSource.push(pi);
    });
  }
  public getColumnHeaderForDays(col: string): string {
    if (col && col.startsWith('days')) {
      const idx = +col.replace('days', '');
      return this.contDays[idx].toString();
    }
    return '';
  }
}
