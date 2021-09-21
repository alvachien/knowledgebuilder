import { Component, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { TagReferenceType, ExerciseItemUserScore } from 'src/app/models';
import { ODataService, PreviewObject } from '../../../services';

@Component({
  selector: 'app-exercise-item-score',
  templateUrl: './exercise-item-score.component.html',
  styleUrls: ['./exercise-item-score.component.scss']
})
export class ExerciseItemScoreComponent implements  AfterViewInit {
  displayedColumns: string[] = ['id', 'refid', 'takendate', 'score'];
  dataSource: ExerciseItemUserScore[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  refreshEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private odataService: ODataService,
    private router: Router) {}

  get isExpertMode(): boolean {
    return this.odataService.expertMode;
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.refreshEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          const top = this.paginator.pageSize;
          const skip = top * this.paginator.pageIndex;
          return this.odataService.getExerciseItemUserScores(top, skip, this.sort.active, this.sort.direction
          );
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.totalCount;

          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      ).subscribe(data => this.dataSource = data);
  }

  public onGoToSearch(): void {
    // this.router.navigate(['knowledge-item', 'search']);
  }
  public onGoToExerciseItems(): void {
    this.router.navigate(['exercise-item']);
  }

  public onPreview(collid: number): void {
    // const arobj: PreviewObject[] = [];
    // this.dataSource.forEach(coll => {
    //   if (coll.ID === collid) {
    //     coll.Items.forEach(item => {
    //       arobj.push({
    //         refType: item.RefType,
    //         refId: item.RefID,
    //       });
    //     });
    //   }
    // });
    // this.odataService.previewObjList = arobj;
    // this.router.navigate(['preview']);
  }

  public onDeleteItem(itemid: number): void {
    // this.odataService.deleteExerciseItem(itemid).subscribe({
    //   next: val => {
    //     // Delete the item specified.
    //     this.onRefreshList();
    //   },
    //   error: err => {
    //     console.error(err);
    //   }
    // });
  }

  onRefreshList(): void {
    this.refreshEvent.emit();
  }

  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }
}
