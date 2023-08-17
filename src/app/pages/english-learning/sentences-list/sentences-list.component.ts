import { Component } from '@angular/core';
import { Router } from '@angular/router';
import sentences from 'src/assets/data/english-sentences/index.json';

@Component({
  selector: 'khb-sentences-list',
  templateUrl: './sentences-list.component.html',
  styleUrls: ['./sentences-list.component.scss'],
})
export class SentencesListComponent {
  displayedColumns: string[] = ['title', 'file', 'collection'];
  dataSource = sentences;
  clickedRows = new Set<any>();

  constructor(private router: Router) {    
  }

  onClick(row: any) {
    this.router.navigate(['english-learning', 'disp-sentence', row.file]);
  }
}
