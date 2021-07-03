import { Component, OnInit } from '@angular/core';
import { momentDateFormat } from 'src/app/models';
import { AwardRuleTypeEnum, } from 'src/app/models/award';
import { ODataService, QuizService } from 'src/app/services';

export interface AwardTimeRuleUI {
  id: number;
  targetUser: string;
  point: number;
  validity: string;
  countOfDays: string;
  timeRange: string;
}

@Component({
  selector: 'app-award-rule',
  templateUrl: './award-rule.component.html',
  styleUrls: ['./award-rule.component.scss'],
})
export class AwardRuleComponent implements OnInit {

  dataSourceGoToBedRule: AwardTimeRuleUI[] = [];
  displayedTimeRuleColumns: string[] = ['id', 'targetUser', 'point', 'validity', 'timeRange', 'countOfDays'];
  goToBedRulesLength = 0;
  dataSourceSchoolWorkRule: AwardTimeRuleUI[] = [];
  schoolWorkRulesLength = 0;

  constructor(private odataSrv: ODataService) { }

  ngOnInit(): void {
    this.odataSrv.getAwardRules(100, 0, undefined).subscribe({
      next: val => {
        this.dataSourceGoToBedRule = [];
        this.dataSourceSchoolWorkRule = [];

        val.items.forEach(item => {
          if (item.ruleType === AwardRuleTypeEnum.GoToBedTime) {
            const nrule: AwardTimeRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              timeRange: item.timeStart?.toString() + ' - ' + item.timeEnd?.toString(),
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceGoToBedRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.SchoolWorkTime) {
            const nrule: AwardTimeRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              timeRange: item.timeStart?.toString() + ' - ' + item.timeEnd?.toString(),
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceSchoolWorkRule.push(nrule);
          }

          this.goToBedRulesLength = this.dataSourceGoToBedRule.length;
          this.schoolWorkRulesLength = this.dataSourceSchoolWorkRule.length;
        });
      },
      error: err => {

      }
    });
  }
}
