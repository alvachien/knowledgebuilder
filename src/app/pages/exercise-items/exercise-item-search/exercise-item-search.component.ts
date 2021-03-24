import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, merge, of as observableOf } from 'rxjs';
import { catchError, finalize, map, startWith, switchMap } from 'rxjs/operators';

import { GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType, UIDisplayString, UIDisplayStringUtil } from 'src/app/models';
import { ODataService } from 'src/app/services';

@Component({
  selector: 'app-exercise-item-search',
  templateUrl: './exercise-item-search.component.html',
  styleUrls: ['./exercise-item-search.component.scss']
})
export class ExerciseItemSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  filters: GeneralFilterItem[] = [];
  allOperators: UIDisplayString[] = [];
  allFields: any[] = [];
  filterEditable = true;
  
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  pageSize = 20;
  pageSizeOptions = [20, 40, 60, 100];
  isLoadingResults = false;
  resultsLength: number;
  subjFilters: BehaviorSubject<any> = new BehaviorSubject([]);

  constructor(private odataService: ODataService) {
    this.resultsLength = 0;
    this.allOperators = UIDisplayStringUtil.getGeneralFilterOperatorDisplayStrings();
    this.allFields = [{
      displayas: 'Content',
      value: 'Content',
      valueType: 2,
    },
    ];
  }

  ngOnInit(): void {
    this.onAddFilter();
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    // this.dataSource.paginator = this.paginator;
    this.subjFilters.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.subjFilters, this.paginator.page)
      .pipe(
        // takeUntil(this._destroyed$),
        startWith({}),
        switchMap(() => {
          if (this.subjFilters.value.length <= 0) {
            return observableOf([]);
          }

          this.isLoadingResults = true;

          return this.odataService.getExerciseItems(30, 0);
        }),
        finalize(() => this.isLoadingResults = false),
        map((data: any) => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          if (data && data.totalCount) {
            this.resultsLength = data.totalCount;
          }

          return data && data.contentList;
        }),
        catchError(() => observableOf(undefined)),
    ).subscribe((photolist: any) => {
      // this.photos = [];
      // if (photolist && photolist instanceof Array) {
      //   for (const ce of photolist) {
      //     const pi: Photo = new Photo();
      //     pi.init(ce);
      //     this.photos.push(pi);
      //   }
      // }
    }, (error: HttpErrorResponse) => {
      // this._snackBar.open('Error occurred: ' + error.message, undefined, {
      //   duration: 3000,
      // });
    }, () => {
      // Do nothing
    });
  }

  public onAddFilter(): void {
    this.filters.push(new GeneralFilterItem());
  }
  public onRemoveFilter(idx: number): void {
    this.filters.splice(idx, 1);
    if (this.filters.length === 0) {
      this.onAddFilter();
    }
  }
  public onFieldSelectionChanged(filter: GeneralFilterItem): void {
    this.allFields.forEach((value: any) => {
      if (value.value === filter.fieldName) {
        filter.valueType = value.valueType;
      }
    });
  }
  public onSearch(): void {
    // Do the translate first
    let arRealFilter: any[] = [];
    this.filters.forEach((value: GeneralFilterItem) => {
      let val: any = {};
      val.valueType = +value.valueType;
      switch (value.valueType) {
        case GeneralFilterValueType.boolean: {
          // val.fieldName = value.fieldName;
          // val.operator = +value.operator;
          // if (value.lowValue) {
          //   val.lowValue = 'true';
          // } else {
          //   val.lowValue = 'false';
          // }
          // val.highValue = '';
          break;
        }

        case GeneralFilterValueType.date: {
          // val.fieldName = value.fieldName;
          // val.operator = +value.operator;
          // val.lowValue = moment(value.lowValue).format('YYYYMMDD');
          // if (value.operator === GeneralFilterOperatorEnum.Between) {
          //   val.highValue = moment(value.highValue).format('YYYYMMDD');
          // } else {
          //   val.highValue = '';
          // }
          break;
        }

        case GeneralFilterValueType.number: {
          // val.fieldName = value.fieldName;
          // val.operator = +value.operator;
          // val.lowValue = +value.lowValue;
          // if (value.operator === GeneralFilterOperatorEnum.Between) {
          //   val.highValue = +value.highValue;
          // } else {
          //   val.highValue = '';
          // }
          break;
        }

        case GeneralFilterValueType.string: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = value.value[0];
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = value.value[1];
          } else {
            val.highValue = '';
          }
          break;
        }

        default:
          break;
      }
      arRealFilter.push(val);
    });

    // Do the real search
    this.subjFilters.next(arRealFilter);
  }

  ngOnDestroy(): void {
    // this._watcherMedia.unsubscribe();
    // this._destroyed$.next(true);
    // this._destroyed$.complete();
  }
}
