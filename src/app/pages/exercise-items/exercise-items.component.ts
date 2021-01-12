import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { ExerciseItem, ExerciseItemType, getExerciseItemTypeName, } from '../../models/exercise-item';
import { ODataService } from '../../services';

@Component({
  selector: 'app-exercise-items',
  templateUrl: './exercise-items.component.html',
  styleUrls: ['./exercise-items.component.scss'],
})
export class ExerciseItemsComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'itemtype', 'knowledgeitem', 'createdat'];
  data: ExerciseItem[] = [];

  resultsLength = 0;
  isLoadingResults = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private odataService: ODataService) {}

  getExerciseItemTypeName(itemtype: ExerciseItemType): string {
    return getExerciseItemTypeName(itemtype);
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.odataService.getExerciseItems(
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
      ).subscribe(data => this.data = data);
  }
}
