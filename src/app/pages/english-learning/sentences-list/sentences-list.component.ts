import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { KatexOptions } from 'ngx-markdown';
import { EnglishSentence } from 'src/app/models';
import { EnglishLearningService, ODataService } from 'src/app/services';
import sentences from 'src/assets/data/english-sentences/index.json';
import { ExerciseSentenceDialog } from './exercise-sent-dlg.component';
import { MatDialog } from '@angular/material/dialog';

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
  execScore = 0;

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

  constructor(private router: Router,
    private _service: ODataService,
    private _engService: EnglishLearningService,
    private _dialog: MatDialog) { }

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

  // Exercise 
  onStartExercise() {
    let sentcnt = this.dataSource.filteredData.length;

    this.dataSource.filteredData.forEach(ds => {
      let fileurl = `assets/data/english-sentences/${ds.folder}/${ds.file}`;
      if (!this._service.setSentFile.has(fileurl)) {
        this._service.setSentFile.add(fileurl);

        this._service.readFileContent(fileurl).subscribe({
          next: val => {
            let sen = new EnglishSentence();
            sen.parseData(val);

            this._engService.englishLearningInstance.addSentence(sen);

            sentcnt--;

            if (sentcnt === 0) {
              this.openDialog();
            }
          },
          error: err => {
            console.error(err);
          }
        });
      } else {
        sentcnt--;

        if (sentcnt === 0) {
          this.openDialog();
        }
      }
    });
  }

  openDialog(): void {
    this._engService.generateExerciseSentences();

    const dialogRef = this._dialog.open(ExerciseSentenceDialog, {
      data: { score: this.execScore },
      width: '600px',
      height: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.execScore = result;
    });
  }


  // Preview
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
