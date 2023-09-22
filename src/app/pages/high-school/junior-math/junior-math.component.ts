import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { KatexOptions } from 'ngx-markdown';

import items from 'src/assets/data/juniorschool-math/index.json';

@Component({
  selector: 'khb-highschool-junior-math',
  templateUrl: './junior-math.component.html',
  styleUrls: ['./junior-math.component.scss'],
})
export class JuniorMathComponent {
  displayedColumns: string[] = ['title', 'file', 'collection'];
  dataSource = new MatTableDataSource<any>(items);

  clickedRows = new Set<any>();
  // Preview mode
  isPreviewMode = false;
  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };
  prvIndex = 0;

  get previewFolderName() {
    return this.dataSource.filteredData.at(this.prvIndex).folder;
  }
  get previewFileName() {
    return this.dataSource.filteredData.at(this.prvIndex).file;
  }
  get mdFilePath() {
    return `assets/data/juniorschool-math/${this.previewFolderName}/${this.previewFileName}`;
  }
  get isNextPreviewButtonEnabled(): boolean {
    return this.prvIndex < this.dataSource.filteredData.length - 1;
  }
  get isPreviousButtonEnabled(): boolean {
    return this.prvIndex > 0;
  }

  constructor(private router: Router) {}

  onClick(row: any) {
    this.router.navigate(['high-school', 'display-item', row.file]);
  }
  onStartPreview() {
    this.prvIndex = 0;
    this.isPreviewMode = true;
  }
  onStopPreview() {
    this.isPreviewMode = false;
  }
  onPreviousPreviewItem() {
    this.prvIndex--;
  }
  onNextPreviewItem() {
    this.prvIndex++;
  }
}
