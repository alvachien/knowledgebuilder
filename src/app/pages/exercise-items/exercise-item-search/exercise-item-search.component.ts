import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { BehaviorSubject, merge, of as observableOf, scheduled } from 'rxjs';
import { catchError, finalize, map, mergeAll, startWith, switchMap } from 'rxjs/operators';

import { ExerciseItem, ExerciseItemType, GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType,
  getExerciseItemTypeName, TagReferenceType, UIDisplayString, UIDisplayStringUtil } from 'src/app/models';
import { ODataService, PreviewObject } from 'src/app/services';

@Component({
  selector: 'app-exercise-item-search',
  templateUrl: './exercise-item-search.component.html',
  styleUrls: ['./exercise-item-search.component.scss']
})
export class ExerciseItemSearchComponent implements OnInit, AfterViewInit {
  filters: GeneralFilterItem[] = [];
  allOperators: UIDisplayString[] = [];
  allFields: any[] = [];
  filterEditable = true;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  pageSize = 20;
  pageSizeOptions = [20, 40, 60, 100];
  isLoadingResults = false;
  resultsLength: number;
  subjFilters: BehaviorSubject<any> = new BehaviorSubject([]);
  // Result
  displayedColumns: string[] = ['id', 'itemtype', 'tags', 'knowledgeitem', 'createdat'];
  dataSource: ExerciseItem[] = [];

  constructor(private odataService: ODataService,
    private router: Router) {
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

    // scheduled([this.subjFilters, this.paginator.page], scheduled)
    //   .pipe(mergeAll())
    merge(this.subjFilters, this.paginator.page)
      .pipe(
        // takeUntil(this._destroyed$),
        startWith({}),
        switchMap(() => {
          if (this.subjFilters.value.length <= 0) {
            return observableOf([]);
          }

          this.isLoadingResults = true;
          // Prepare filters
          const filter = this.prepareFilters(this.subjFilters.value);
          const top = this.paginator.pageSize;
          const skip = top * this.paginator.pageIndex;

          return this.odataService.getExerciseItems(top, skip, undefined, undefined, filter);
        }),
        finalize(() => this.isLoadingResults = false),
        map((data: any) => {
          this.resultsLength = data.totalCount;

          return data.items;
        }),
        catchError(() => observableOf(undefined)),
    ).subscribe({
      next: data => this.dataSource = data,
      error: err => console.log(err)
    });
  }
  getExerciseItemTypeName(itemtype: ExerciseItemType): string {
    return getExerciseItemTypeName(itemtype);
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
  prepareFilters(arFilter: any[]): string {
    let rstfilter = '';
    arFilter.sort((a, b) => a.fieldName.localeCompare(b.fieldName));

    arFilter.forEach(flt => {
      if (flt.fieldName === 'Content') {
        if (flt.operator === GeneralFilterOperatorEnum.Equal) {
          rstfilter = rstfilter ? `${rstfilter} and ${flt.fieldName} eq '${flt.lowValue}'`
            : `${flt.fieldName} eq '${flt.lowValue}'`;
        } else if(flt.operator === GeneralFilterOperatorEnum.Like) {
          rstfilter = rstfilter ? `${rstfilter} and contains(${flt.fieldName},'${flt.lowValue}')`
            : `contains(${flt.fieldName},'${flt.lowValue}')`;
        }
      }
    });
    return rstfilter;
  }
  public onSearch(): void {
    // Do the translate first
    const arRealFilter: any[] = [];
    this.filters.forEach((value: GeneralFilterItem) => {
      const val: any = {};
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
  public onDisplayItem(itemid: number): void {
    this.router.navigate(['exercise-item', 'display', itemid.toString()]);
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
}
