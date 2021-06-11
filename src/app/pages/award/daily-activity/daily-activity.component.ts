import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-daily-activity',
  templateUrl: './daily-activity.component.html',
  styleUrls: ['./daily-activity.component.scss']
})
export class DailyActivityComponent implements OnInit {
  selected: Date | null;
  constructor() { }

  ngOnInit(): void {
  }
}
