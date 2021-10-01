import { Component, OnInit } from '@angular/core';
import { AwardRule, getAwardRuleTypeNames } from 'src/app/models';
import { ODataService } from 'src/app/services';

@Component({
  selector: 'app-award-rule-generation',
  templateUrl: './award-rule-generation.component.html',
  styleUrls: ['./award-rule-generation.component.scss']
})
export class AwardRuleGenerationComponent implements OnInit {
  // eslint-disable-next-line @angular-eslint/component-class-suffix
  displayedColumns: string[] = ['desp', 'validFrom', 'validTo', 'countOfFactLow', 'countOfFactHigh', 'timeStart', 'timeEnd',
    'daysFrom', 'daysTo', 'point', 'edit'];
  dataSource: AwardRule[] = [];
  dataSchema: { [key: string]: any } = {
    // ruleType: AwardRuleTypeEnum = AwardRuleTypeEnum.GoToBedTime;
    // 'targetUser': 'text',
    desp: 'text',
    validFrom: 'date',
    validTo: 'date',
    countOfFactLow: 'number',
    countOfFactHigh: 'number',
    // 'doneOfFact': 'boolean',
    timeStart: 'number',
    timeEnd: 'number',
    daysFrom: 'number',
    daysTo: 'number',
    point: 'number',
    edit: 'edit',
  };
  step = 0;
  arRuleTypes: any[] = [];

  constructor(private odataSrv: ODataService) {
    this.arRuleTypes = getAwardRuleTypeNames();
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
}
