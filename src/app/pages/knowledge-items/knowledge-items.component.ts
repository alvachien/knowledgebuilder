import { Component, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { KnowledgeItemCategory, getKnowledgeItemCategoryName, KnowledgeItem, TagReferenceType } from 'src/app/models';
import { ODataService, PreviewObject, UIUtilityService, } from '../../services';

@Component({
  selector: 'app-knowledge-items',
  templateUrl: './knowledge-items.component.html',
  styleUrls: ['./knowledge-items.component.scss'],
})
export class KnowledgeItemsComponent implements AfterViewInit {
  displayedColumns: string[] = ['id', 'category', 'title', 'createdat'];
  dataSource: KnowledgeItem[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  refreshEvent: EventEmitter<any> = new EventEmitter();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private odataService: ODataService,
    private uiUtilSrv: UIUtilityService) {}

  getKnowledgeItemCategoryName(ctgy: KnowledgeItemCategory): string {
    return getKnowledgeItemCategoryName(ctgy);
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
          return this.odataService.getKnowledgeItems(top, skip, this.sort.active, this.sort.direction
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

  public onGoToPreview(): void {
    const arobj: PreviewObject[] = [];
    this.dataSource.forEach(val => {
      arobj.push({
        refType: TagReferenceType.KnowledgeItem,
        refId: val.ID,
      });
    });
    this.uiUtilSrv.navigatePreviewPage(arobj);
  }
  onGoToSearch(): void {
    this.uiUtilSrv.navigateKnowledgeItemSearchPage();
  }

  public onDeleteItem(itemid: number): void {
    this.odataService.deleteExerciseItem(itemid).subscribe({
      next: val => {
        // Delete the item specified.
        this.onRefreshList();
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }

  onRefreshList(): void {
    this.refreshEvent.emit();
  }

  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }
}
