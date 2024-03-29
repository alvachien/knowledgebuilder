import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { TagCount, TagReferenceType, getTagReferenceTypeName } from 'src/app/models';
import { ODataService } from '../../services';

@Component({
  selector: 'khb-tag',
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss'],
})
export class TagComponent implements AfterViewInit {
  displayedColumns: string[] = ['tag', 'reftype', 'count'];
  data: TagCount[] = [];

  resultsLength = 0;
  isLoadingResults = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private odataService: ODataService, private router: Router) {}

  getTagReferenceTypeName(reftype: TagReferenceType): string {
    return getTagReferenceTypeName(reftype);
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.odataService.getTagCounts();
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
      .subscribe((data) => (this.data = data));
  }

  public onCountClicked(row: TagCount): void {
    // console.log(`Count link clicked: ${row}`);
    if (row.RefType === TagReferenceType.KnowledgeItem) {
      this.router.navigate(['/tag/displayki', row.TagTerm]);
    } else if (row.RefType === TagReferenceType.ExerciseItem) {
      this.router.navigate(['/tag/displayei', row.TagTerm]);
    } else {
      this.router.navigate(['/tag/display', row.TagTerm]);
    }
  }
}
