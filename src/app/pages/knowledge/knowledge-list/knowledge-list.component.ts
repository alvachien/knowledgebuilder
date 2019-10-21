import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';

import { OdataService } from '../../../services';
import { KnowledgeItem } from '../../../models';

@Component({
  selector: 'app-knowledge-list',
  templateUrl: './knowledge-list.component.html',
  styleUrls: ['./knowledge-list.component.less']
})
export class KnowledgeListComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;
  listOfItems: KnowledgeItem[] = [];
  isReload = false;
  pageIndex = 0;
  pageSize = 10;
  totalItemCount = 0;

  constructor(private oDataSvc: OdataService) {
    this.isLoadingResults = false;
  }

  ngOnInit() {
    this._destroyed$ = new ReplaySubject(1);

    this._fetchData();
  }

  ngOnDestroy() {
    if (this._destroyed$) {
      this._destroyed$.next(true);
      this._destroyed$.complete();
    }
  }

  private _fetchData(reset: boolean = false): void {
    if (reset) {
      this.pageIndex = 0;
    }
    this.isLoadingResults = true;
    this.oDataSvc.fetchAllKnowledges(this.pageSize, this.pageIndex * this.pageSize)
      .pipe(
        takeUntil(this._destroyed$),
        map((revdata: KnowledgeItem[]) => {
          return revdata;
        }),
        catchError((error: any) => {
          // popupDialog(this._dialog, this._uiStatusService.getUILabel(UICommonLabelEnum.Error),
          //   error ? error.toString() : this._uiStatusService.getUILabel(UICommonLabelEnum.Error));

          return of([]);
        }),
      ).subscribe((data: KnowledgeItem[]) => {
        this.isLoadingResults = false;
        this.totalItemCount = this.oDataSvc.KnowledgeItemsCount;
        this.listOfItems = [];
        this.listOfItems.push(...data);
      });
  }
}
