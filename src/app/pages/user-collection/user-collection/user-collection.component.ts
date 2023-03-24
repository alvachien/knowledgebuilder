import { Component, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { UserCollection } from 'src/app/models';
import { ODataService, PreviewObject, UIUtilityService } from '../../../services';

@Component({
  selector: 'app-user-collection',
  templateUrl: './user-collection.component.html',
  styleUrls: ['./user-collection.component.scss'],
})
export class UserCollectionComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'comment', 'createdat'];
  dataSource: UserCollection[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refreshEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private odataService: ODataService, private uiUtilSrv: UIUtilityService) {}

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page, this.refreshEvent)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;

          const top = this.paginator.pageSize;
          const skip = top * this.paginator.pageIndex;
          return this.odataService.getUserCollections(top, skip, this.sort.active, this.sort.direction);
        }),
        map((data) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.resultsLength = data.totalCount;

          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          return observableOf([]);
        })
      )
      .subscribe((data) => (this.dataSource = data));
  }

  onGoToSearch(): void {
    // this.router.navigate(['knowledge-item', 'search']);
  }

  public onPreview(collid: number): void {
    const arobj: PreviewObject[] = [];
    this.dataSource.forEach((coll) => {
      if (coll.ID === collid) {
        coll.Items.forEach((item) => {
          arobj.push({
            refType: item.RefType,
            refId: item.RefID,
          });
        });
      }
    });
    this.uiUtilSrv.navigatePreviewPage(arobj);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
