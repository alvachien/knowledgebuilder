import {
  Component,
  EventEmitter,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import {
  KnowledgeItemCategory,
  getKnowledgeItemCategoryName,
  KnowledgeItem,
  TagReferenceType,
  UserCollectionItem,
} from 'src/app/models';
import {
  AuthService,
  ODataService,
  PreviewObject,
  UIUtilityService,
} from '../../services';
import { KnowledgeItemAddToCollDialog } from './knowledge-items-add-coll-dlg.component';

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

  constructor(
    private odataService: ODataService,
    private dialog: MatDialog,
    private uiUtilSrv: UIUtilityService,
    private authService: AuthService
  ) {}

  getKnowledgeItemCategoryName(ctgy: KnowledgeItemCategory): string {
    return getKnowledgeItemCategoryName(ctgy);
  }
  get isExpertMode(): boolean {
    return this.authService.isAuthenticated;
  }

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
          return this.odataService.getKnowledgeItems(
            top,
            skip,
            this.sort.active,
            this.sort.direction
          );
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

  public onGoToPreview(): void {
    const arobj: PreviewObject[] = [];
    this.dataSource.forEach((val) => {
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
      next: (val) => {
        // Delete the item specified.
        this.onRefreshList();
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
    });
  }

  public onAddToCollection(rid: number): void {
    this.odataService.getUserCollections().subscribe({
      next: (val) => {
        const arColls = val.items;
        const dialogRef = this.dialog.open(KnowledgeItemAddToCollDialog, {
          width: '600px',
          closeOnNavigation: false,
          data: {
            knowledgeitemid: rid,
            availableColls: arColls,
            collids: [],
          },
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          const collitems: UserCollectionItem[] = [];
          result.collids.forEach((collid: any) => {
            const colidx = arColls.findIndex((coll) => coll.ID === +collid);
            if (colidx !== -1) {
              const collitem: UserCollectionItem = new UserCollectionItem();
              collitem.ID = arColls[colidx].ID;
              collitem.RefID = rid;
              collitem.RefType = TagReferenceType.KnowledgeItem;
              collitems.push(collitem);
            }
          });

          if (collitems.length > 0) {
            this.odataService
              .addKnowledgeItemToCollection(collitems)
              .subscribe({
                next: (val2) => {
                  this.uiUtilSrv.showSnackInfo('DONE');
                },
                error: (err) => {
                  this.uiUtilSrv.showSnackInfo(err);
                },
              });
          }
        });
      },
      error: (err) => {
        this.uiUtilSrv.showSnackInfo(err);
      },
    });
  }

  onRefreshList(): void {
    this.refreshEvent.emit();
  }

  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }
}
