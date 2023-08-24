import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import sentences from 'src/assets/data/english-sentences/index.json';

@Component({
  selector: 'khb-sentences-list',
  templateUrl: './sentences-list.component.html',
  styleUrls: ['./sentences-list.component.scss'],
})
export class SentencesListComponent implements AfterViewInit {
  displayedColumns: string[] = ['title', 'folder', 'file', 'collection'];  
  clickedRows = new Set<any>();
  dataSource = new MatTableDataSource<any>(sentences);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router) {    
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onClick(row: any) {
    this.router.navigate(['english-learning', 'disp-sentence', row.folder, row.file]);
  }
}
