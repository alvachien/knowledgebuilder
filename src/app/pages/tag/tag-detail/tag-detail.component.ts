import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { KatexOptions } from 'ngx-markdown';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { TagCount, Tag, TagReferenceType, getTagReferenceTypeName } from 'src/app/models';
import { PreviewObject, ODataService } from 'src/app/services';

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

  getTagReferenceTypeName = getTagReferenceTypeName;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private odataService: ODataService,
    private activateRoute: ActivatedRoute,
    private router: Router) {
  }

  ngOnInit(): void {
    this.activateRoute.url.subscribe({
      next: val => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'display') {
            this.currenttag = val[1].path;
          }
        }
      },
      error: err => {
        console.error(err);
      }
    });
  }

  ngAfterViewInit(): void {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.odataService.getTags(this.currenttag);
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

  public onRefIDClicked(row: Tag): void {
    // console.log(`Count link clicked: ${row}`);
    if (row.RefType === TagReferenceType.ExerciseItem) {
      this.router.navigate(['exercise-item/display', row.RefID]);
    } else if (row.RefType === TagReferenceType.KnowledgeItem) {
      this.router.navigate(['knowledge-item/display', row.RefID]);
    }
  }
  public onGoToPreview(): void {
    const arobj: PreviewObject[] = [];
    this.dataSource.forEach(val => {
      if (val.RefType && val.RefID) {
        arobj.push({
          refType: val.RefType,
          refId: val.RefID
        });
      }
    });
    this.odataService.previewObjList = arobj;
    this.router.navigate(['preview']);
  }
}
