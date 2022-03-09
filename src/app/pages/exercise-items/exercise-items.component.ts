import { Component, OnInit, ViewChild, AfterViewInit, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, finalize, map, startWith, switchMap } from 'rxjs/operators';
import { TagReferenceType, UserCollectionItem } from 'src/app/models';

import { ExerciseItem, ExerciseItemType, ExerciseItemUserScore, getExerciseItemTypeName, } from '../../models/exercise-item';
import { ODataService, PreviewObject, UIUtilityService, } from '../../services';
import { ExerciseItemAddToCollDialog } from './exercise-items-add-coll-dlg.component';
import { ExerciseItemNewPracticeDialog } from './exercise-items-newpractice-dlg.component';

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
    private dialog: MatDialog,
    private uiUtilSrv: UIUtilityService) {}

  getExerciseItemTypeName(itemtype: ExerciseItemType): string {
    return getExerciseItemTypeName(itemtype);
  }
  get isExpertMode(): boolean {
    return this.odataService.isLoggedin;
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
          return this.odataService.getExerciseItems(top, skip, this.sort.active, this.sort.direction);
        }),
        finalize(() => this.isLoadingResults = false),
        map(data => {
          this.resultsLength = data.totalCount;

          return data.items;
        }),
        catchError(() => observableOf([]))
      ).subscribe({
        next: data => this.dataSource = data,
        error: err => this.uiUtilSrv.showSnackInfo(err)
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
    this.uiUtilSrv.navigatePreviewPage(arobj);
  }
  public onGoToSearch(): void {
    this.uiUtilSrv.navigateExerciseItemSearchPage();
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

  public onRefreshList(): void {
    this.refreshEvent.emit();
  }

  resetPaging(): void {
    this.paginator.pageIndex = 0;
  }
  public onDisplayItem(rid: number): void {
    this.uiUtilSrv.navigateExerciseItemDisplayPage(rid);
  }
  public onChangeItem(rid: number): void {
    this.uiUtilSrv.navigateExerciseItemChangePage(rid);
  }
  public onAddToCollection(rid: number): void {
    this.odataService.getUserCollections().subscribe({
      next: val => {
        const arColls = val.items;
        const dialogRef = this.dialog.open(ExerciseItemAddToCollDialog, {
          width: '600px',
          closeOnNavigation: false,
          data: {
            excitemid: rid,
            availableColls: arColls,
            collids: [],
          },
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          const collitems: UserCollectionItem[] = [];
          result.collids.forEach((collid: any) => {
            const colidx = arColls.findIndex(coll => coll.ID === +collid);
            if (colidx !== -1) {
              const collitem: UserCollectionItem = new UserCollectionItem();
              collitem.ID = arColls[colidx].ID;
              collitem.RefID = rid;
              collitem.RefType = TagReferenceType.ExerciseItem;
              collitems.push(collitem);
            }
          });

          if (collitems.length > 0) {
            this.odataService.addExerciseItemToCollection(collitems).subscribe({
              next: val2 => {
                this.uiUtilSrv.showSnackInfo('DONE');
              },
              error: err => {
                this.uiUtilSrv.showSnackInfo(err);
              }
            });
          }
        });
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }
  public onNewPractice(rid: number): void {
    const dialogRef = this.dialog.open(ExerciseItemNewPracticeDialog, {
      width: '600px',
      closeOnNavigation: false,
      data: {
        excitemid: rid,
        pracDate: new Date().toDateString(),
        score: undefined,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      // Now submit!
      const nscore = new ExerciseItemUserScore();
      nscore.RefID = rid;
      nscore.Score = result.score;
      nscore.TakenDate = new Date();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      nscore.User = this.odataService.currentUser!.getUserId();
      this.odataService.createExerciseItemUserScore(nscore).subscribe({
        next: val => {
          this.uiUtilSrv.showSnackInfo('DONE');
        },
        error: err => {
          this.uiUtilSrv.showSnackInfo(err);
        }
      });
    });
  }
}
