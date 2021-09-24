import { Component, EventEmitter, ViewChild, AfterViewInit, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import moment from 'moment';
import { BehaviorSubject, merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import { GeneralFilterItem, GeneralFilterOperatorEnum, GeneralFilterValueType,
  UIDisplayString, UIDisplayStringUtil, ExerciseItemUserScore } from 'src/app/models';
import { ODataService, PreviewObject } from '../../../services';

@Component({
  selector: 'app-exercise-item-score',
  templateUrl: './exercise-item-score.component.html',
  styleUrls: ['./exercise-item-score.component.scss']
})
export class ExerciseItemScoreComponent implements OnInit, AfterViewInit {
  public filters: GeneralFilterItem[] = [];
  public allOperators: UIDisplayString[] = [];
  public allFields: any[] = [];
  filterEditable = true;

  displayedColumns: string[] = ['id', 'refid', 'takendate', 'score'];
  dataSource: ExerciseItemUserScore[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  refreshEvent: EventEmitter<any> = new EventEmitter();
  subjFilters: BehaviorSubject<any> = new BehaviorSubject([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private odataService: ODataService,
    private router: Router) {
    this.allOperators = UIDisplayStringUtil.getGeneralFilterOperatorDisplayStrings();
    this.allFields = [{
      displayas: 'Content',
      value: 'Content',
      valueType: 2,
    }, {
      displayas: 'Quiz.Date',
      value: 'TakenDate',
      valueType: 3,
    }, {
      displayas: 'Quiz.Score',
      value: 'Score',
      valueType: 1,
    }, {
      displayas: 'Type',
      value: 'ExerciseType',
      valueType: 2,
    },
    ];
  }

  get isExpertMode(): boolean {
    return this.odataService.expertMode;
  }
  ngOnInit(): void {
    this.onAddFilter();
  }

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page, this.refreshEvent, this.subjFilters)
      .pipe(
        startWith({}),
        switchMap(() => {
          if (this.subjFilters.value.length <= 0) {
            return observableOf([]);
          }
          this.isLoadingResults = true;

          const filter = this.prepareFilters(this.subjFilters.value);
          const top = this.paginator.pageSize;
          const skip = top * this.paginator.pageIndex;
          return this.odataService.getExerciseItemUserScores(top, skip, filter);
        }),
        map((data: any) => {
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
    let arfieldNames = arFilter.map(val => val.fieldName);
    arfieldNames = Array.from(new Set(arfieldNames));

    arfieldNames.forEach(fname => {
      let substring = '';
      arFilter.forEach(flt => {
        if (flt.fieldName === fname) {
          if (flt.fieldName === 'Content' || flt.fieldName === 'Tags') {
            if (flt.operator === GeneralFilterOperatorEnum.Equal) {
              substring = substring ? `${substring} or ${flt.fieldName} eq '${flt.lowValue}'`
                : `${flt.fieldName} eq '${flt.lowValue}'`;
            } else if(flt.operator === GeneralFilterOperatorEnum.Like) {
              substring = substring ? `${substring} or contains(${flt.fieldName},'${flt.lowValue}')`
                : `contains(${flt.fieldName},'${flt.lowValue}')`;
            }
          } else if (flt.fieldName === 'Score') {
            if (flt.operator === GeneralFilterOperatorEnum.Equal) {
              substring = substring ? `${substring} or ${flt.fieldName} eq ${flt.lowValue}`
                : `${flt.fieldName} eq ${flt.lowValue}`;
            } else if(flt.operator === GeneralFilterOperatorEnum.LargerEqual) {
              substring = substring ? `${substring} or ${flt.fieldName} ge ${flt.lowValue}`
                : `${flt.fieldName} ge ${flt.lowValue}`;
            } else if(flt.operator === GeneralFilterOperatorEnum.LargerThan) {
              substring = substring ? `${substring} or ${flt.fieldName} gt ${flt.lowValue}`
                : `${flt.fieldName} gt ${flt.lowValue}`;
            } else if(flt.operator === GeneralFilterOperatorEnum.LessEqual) {
              substring = substring ? `${substring} or ${flt.fieldName} le ${flt.lowValue}`
                : `${flt.fieldName} le ${flt.lowValue}`;
            } else if(flt.operator === GeneralFilterOperatorEnum.LessThan) {
              substring = substring ? `${substring} or ${flt.fieldName} lt ${flt.lowValue}`
                : `${flt.fieldName} lt ${flt.lowValue}`;
            } else if(flt.operator === GeneralFilterOperatorEnum.NotEqual) {
              substring = substring ? `${substring} or ${flt.fieldName} ne ${flt.lowValue}`
                : `${flt.fieldName} ne ${flt.lowValue}`;
            }
          } else if (flt.fieldName === 'TakenDate') {
            if (flt.operator === GeneralFilterOperatorEnum.Equal) {
              substring = substring ? `${substring} or ${flt.fieldName} eq ${flt.lowValue}`
                : `${flt.fieldName} eq ${flt.lowValue}`;
            } else if(flt.operator === GeneralFilterOperatorEnum.LargerEqual) {
              substring = substring ? `${substring} or ${flt.fieldName} ge '${flt.lowValue}'`
                : `${flt.fieldName} ge '${flt.lowValue}'`;
            } else if(flt.operator === GeneralFilterOperatorEnum.LargerThan) {
              substring = substring ? `${substring} or ${flt.fieldName} gt '${flt.lowValue}'`
                : `${flt.fieldName} gt '${flt.lowValue}'`;
            } else if(flt.operator === GeneralFilterOperatorEnum.LessEqual) {
              substring = substring ? `${substring} or ${flt.fieldName} le ${flt.lowValue}`
                : `${flt.fieldName} le ${flt.lowValue}`;
            } else if(flt.operator === GeneralFilterOperatorEnum.LessThan) {
              substring = substring ? `${substring} or ${flt.fieldName} lt ${flt.lowValue}`
                : `${flt.fieldName} lt ${flt.lowValue}`;
            } else if(flt.operator === GeneralFilterOperatorEnum.NotEqual) {
              substring = substring ? `${substring} or ${flt.fieldName} ne ${flt.lowValue}`
                : `${flt.fieldName} ne ${flt.lowValue}`;
            }
          }
        }
      });

      rstfilter = rstfilter ? `${rstfilter} and ${substring}` : `${substring}`;
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
          break;
        }

        case GeneralFilterValueType.date: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = moment(value.value[0]).format('YYYYMMDD');
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = moment(value.value[1]).format('YYYYMMDD');
          } else {
            val.highValue = '';
          }
          break;
        }

        case GeneralFilterValueType.number: {
          val.fieldName = value.fieldName;
          val.operator = +value.operator;
          val.lowValue = +value.value[0];
          if (value.operator === GeneralFilterOperatorEnum.Between) {
            val.highValue = +value.value[1];
          } else {
            val.highValue = '';
          }
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
  public onGoToSearch(): void {
    // this.router.navigate(['knowledge-item', 'search']);
  }
  public onGoToExerciseItems(): void {
    this.router.navigate(['exercise-item']);
  }

  public onPreview(collid: number): void {
    // const arobj: PreviewObject[] = [];
    // this.dataSource.forEach(coll => {
    //   if (coll.ID === collid) {
    //     coll.Items.forEach(item => {
    //       arobj.push({
    //         refType: item.RefType,
    //         refId: item.RefID,
    //       });
    //     });
    //   }
    // });
    // this.odataService.previewObjList = arobj;
    // this.router.navigate(['preview']);
  }

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
