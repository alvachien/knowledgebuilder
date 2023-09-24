import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { KatexOptions } from 'ngx-markdown';
import sentences from 'src/assets/data/english-sentences/index.json';

@Component({
  selector: 'khb-sentences-list',
  templateUrl: './sentences-list.component.html',
  styleUrls: ['./sentences-list.component.scss'],
})
export class SentencesListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['title', 'folder', 'file', 'collection'];
  clickedRows = new Set<any>();
  dataSource = new MatTableDataSource<any>(sentences);
  allCollections: string[] = [];
  selectedCollection = '';
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
    return `assets/data/english-sentences/${this.previewFolderName}/${this.previewFileName}`;
  }
  get isNextPreviewButtonEnabled(): boolean {
    return this.prvIndex < this.dataSource.filteredData.length - 1;
  }
  get isPreviousButtonEnabled(): boolean {
    return this.prvIndex > 0;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const setColl = new Set<string>();
    this.dataSource.data.forEach((val) => {
      if (!setColl.has(val.collection)) {
        setColl.add(val.collection);
      }
    });
    this.allCollections = Array.from(setColl.keys());

    this.dataSource.filterPredicate = (record, filter) => {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      return record.collection === filter;
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  onClick(row: any) {
    this.router.navigate(['english-learning', 'disp-sentence', row.folder, row.file]);
  }

  onCollectionSelectionChanged(evnt: any) {
    this.dataSource.filter = this.selectedCollection;
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
