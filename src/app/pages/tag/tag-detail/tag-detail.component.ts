import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { Tag, TagReferenceType, getTagReferenceTypeName } from 'src/app/models';
import {
  PreviewObject,
  UIUtilityService,
  ODataService,
} from 'src/app/services';

@Component({
  selector: 'app-tag-detail',
  templateUrl: './tag-detail.component.html',
  styleUrls: ['./tag-detail.component.scss'],
})
export class TagDetailComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['tag', 'reftype', 'refid'];
  dataSource: Tag[] = [];
  currenttag = '';

  resultsLength = 0;
  isLoadingResults = true;
  refType: TagReferenceType | undefined = undefined;

  getTagReferenceTypeName = getTagReferenceTypeName;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private odataService: ODataService,
    private activateRoute: ActivatedRoute,
    private uiUtilSrv: UIUtilityService
  ) {}

  ngOnInit(): void {
    this.activateRoute.url.subscribe({
      next: (val) => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'display') {
            this.currenttag = val[1].path;
            this.refType = undefined;
          } else if (val[0].path === 'displayki') {
            this.currenttag = val[1].path;
            this.refType = TagReferenceType.KnowledgeItem;
          } else if (val[0].path === 'displayei') {
            this.currenttag = val[1].path;
            this.refType = TagReferenceType.ExerciseItem;
          }
        }
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.odataService.getTags(this.currenttag, this.refType);
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

  public onRefIDClicked(row: Tag): void {
    // console.log(`Count link clicked: ${row}`);
    if (row.RefType === TagReferenceType.ExerciseItem) {
      this.uiUtilSrv.navigateExerciseItemDisplayPage(row.RefID ?? 0);
    } else if (row.RefType === TagReferenceType.KnowledgeItem) {
      this.uiUtilSrv.navigateKnowledgeItemDisplayPage(row.RefID ?? 0);
    }
  }
  public onGoToPreview(): void {
    const arobj: PreviewObject[] = [];
    this.dataSource.forEach((val) => {
      if (val.RefType && val.RefID) {
        arobj.push({
          refType: val.RefType,
          refId: val.RefID,
        });
      }
    });
    this.uiUtilSrv.navigatePreviewPage(arobj);
  }
}
