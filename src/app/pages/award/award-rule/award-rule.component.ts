import { Component, OnInit } from '@angular/core';
import { QuizService } from 'src/app/services';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-award-rule',
  templateUrl: './award-rule.component.html',
  styleUrls: ['./award-rule.component.scss'],
})
export class AwardRuleComponent implements OnInit {

  displayedColumns: string[] = ['rule', 'day1', 'day2', 'day3', 'day4'];
  dataSource = ELEMENT_DATA;

  constructor(private quizSrv: QuizService) { }

  ngOnInit(): void {
  }
}
