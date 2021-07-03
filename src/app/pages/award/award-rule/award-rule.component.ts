import { Component, OnInit } from '@angular/core';
import { momentDateFormat } from 'src/app/models';
import { AwardRuleTypeEnum, RuleType } from 'src/app/models/award';
import { ODataService, QuizService } from 'src/app/services';

export interface AwardGoToBedRuleUI {
  id: number;
  targetUser: string;
  point: number;
  validity: string;
  timeRange: string;
}

@Component({
  selector: 'app-award-rule',
  templateUrl: './award-rule.component.html',
  styleUrls: ['./award-rule.component.scss'],
})
export class AwardRuleComponent implements OnInit {

  dataSourceGoToBedRule: AwardGoToBedRuleUI[] = [];
  displayedGoToBedRuleColumns: string[] = ['id', 'targetUser', 'point', 'validity', 'timeRange'];
  goToBedRulesLength = 0;

  constructor(private odataSrv: ODataService) { }

  ngOnInit(): void {
    this.dataSourceGoToBedRule = [];
    this.odataSrv.getAwardRules(100, 0, undefined).subscribe({
      next: val => {
        val.items.forEach(item => {
          if (item.ruleType === AwardRuleTypeEnum.goToBedTime) {
            const nrule: AwardGoToBedRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              timeRange: item.timeStart?.toString() + ' - ' + item.timeEnd?.toString()
            };
            this.dataSourceGoToBedRule.push(nrule);
          }
          this.goToBedRulesLength = this.dataSourceGoToBedRule.length;
        });
      },
      error: err => {

      }
    });
  }
}
