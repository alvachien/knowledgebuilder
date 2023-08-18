import { Component } from '@angular/core';
import { Router } from '@angular/router';

import items from 'src/assets/data/highschool-math/index.json';

@Component({
  selector: 'khb-highschool-senior-math',
  templateUrl: './senior-math.component.html',
  styleUrls: ['./senior-math.component.scss']
})
export class SeniorMathComponent {
  displayedColumns: string[] = ['title', 'file', 'collection'];
  dataSource = items;
  clickedRows = new Set<any>();

  constructor(private router: Router) {    
  }

  onClick(row: any) {
    this.router.navigate(['high-school', 'display-hsmath-item', row.file]);
  }
}
