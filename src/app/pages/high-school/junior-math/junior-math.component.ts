import { Component } from '@angular/core';
import { Router } from '@angular/router';

import items from 'src/assets/data/juniorschool-math/index.json';

@Component({
  selector: 'khb-highschool-junior-math',
  templateUrl: './junior-math.component.html',
  styleUrls: ['./junior-math.component.scss']
})
export class JuniorMathComponent {
  displayedColumns: string[] = ['title', 'file', 'collection'];
  dataSource = items;
  clickedRows = new Set<any>();

  constructor(private router: Router) {    
  }

  onClick(row: any) {
    this.router.navigate(['english-learning', 'disp-sentence', row.file]);
  }

}
