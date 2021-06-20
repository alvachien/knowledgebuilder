import { Component, OnInit } from '@angular/core';
import { RuleType } from 'src/app/models/award';
import { QuizService } from 'src/app/services';

export interface dbawardrule {
  user: string;
  ruletype: RuleType;
  timefrom: number;
  timeto: number;
  dayfrom: number;
  dayto: number;
  point: number;
}

@Component({
  selector: 'app-award-rule',
  templateUrl: './award-rule.component.html',
  styleUrls: ['./award-rule.component.scss'],
})
export class AwardRuleComponent implements OnInit {

  displayedColumns: string[] = ['user', 'ruletype', 'timefrom', 'timeto', 'dayfrom', 'dayto', 'point'];
  dataSource: dbawardrule[] = [];

  constructor(private quizSrv: QuizService) { }

  ngOnInit(): void {
    this.dataSource = [];
    this.dataSource.push({
      user: 'AAA',
      ruletype: RuleType.goToBedTime,
      timefrom: 20,
      timeto: 21,
      dayfrom: 1,
      dayto: 1,
      point: 1
    });
    this.dataSource.push({
      user: 'AAA',
      ruletype: RuleType.goToBedTime,
      timefrom: 20,
      timeto: 21,
      dayfrom: 2,
      dayto: 2,
      point: 3
    });
    this.dataSource.push({
      user: 'AAA',
      ruletype: RuleType.goToBedTime,
      timefrom: 20,
      timeto: 21,
      dayfrom: 3,
      dayto: 3,
      point: 5
    });
  }
}
