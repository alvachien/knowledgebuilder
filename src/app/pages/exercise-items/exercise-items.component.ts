import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, finalize, map, startWith, switchMap } from 'rxjs/operators';
import { TagReferenceType } from 'src/app/models';

import { ExerciseItem, ExerciseItemType, getExerciseItemTypeName, } from '../../models/exercise-item';
import { ODataService, PreviewObject } from '../../services';

@Component({
  selector: 'app-exercise-items',
  templateUrl: './exercise-items.component.html',
  styleUrls: ['./exercise-items.component.scss'],
})
export class ExerciseItemsComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'itemtype', 'tags', 'knowledgeitem', 'createdat'];
  dataSource: ExerciseItem[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  refreshEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private odataService: ODataService,
    private router: Router) {}

  getExerciseItemTypeName(itemtype: ExerciseItemType): string {
    return getExerciseItemTypeName(itemtype);
  }
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
          return this.odataService.getExerciseItems(top, skip, this.sort.active, this.sort.direction
          );
        }),
        finalize(() => this.isLoadingResults = false),
        map(data => {
          this.resultsLength = data.totalCount;

          return data.items;
        }),
        catchError(() => observableOf([]))
      ).subscribe({
        next: data => this.dataSource = data,
        error: err => console.log(err)
      });
  }

  public onGoToPreview(): void {
    const arobj: PreviewObject[] = [];
    this.dataSource.forEach(val => {
      arobj.push({
        refType: TagReferenceType.ExerciseItem,
        refId: val.ID,
      });
    });
    this.odataService.previewObjList = arobj;
    this.router.navigate(['preview']);
  }
  onGoToSearch(): void {
    this.router.navigate(['exercise-item', 'search']);
  }

  public onDeleteItem(itemid: number): void {
    this.odataService.deleteExerciseItem(itemid).subscribe({
      next: val => {
        // Delete the item specified.
        this.onRefreshList();
      },
      error: err => {
        console.error(err);
      }
    });
  }

  onRefreshList(): void {
    this.refreshEvent.emit();
  }

  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }
  onDisplayItem(rid: number): void {
    this.router.navigate(['exercise-item', 'display', rid.toString()]);
  }
  onChangeItem(rid: number): void {
    this.router.navigate(['exercise-item', 'edit', rid.toString()]);
  }
}
