import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActivatedRoute, } from '@angular/router';

import { UIUtilityService, ODataService, } from 'src/app/services';

@Component({
  selector: 'app-award-rule-display',
  templateUrl: './award-rule-display.component.html',
  styleUrls: ['./award-rule-display.component.scss'],
})
export class AwardRuleDisplayComponent implements OnInit, OnDestroy {
  private destroyed$?: ReplaySubject<boolean>;
  private routerID = -1;

  constructor(private activateRoute: ActivatedRoute,
    private uiUtilSrv: UIUtilityService,
    private odataService: ODataService) { }

  ngOnInit(): void {
    this.destroyed$ = new ReplaySubject(1);

    this.activateRoute.url.subscribe({
      next: val => {
        if (val instanceof Array && val.length > 0) {
          if (val[0].path === 'rule-group-display') {
            this.routerID = +val[1].path;
          }
        }

        if (this.routerID !== -1) {
          // this.odataService.get
        }
      },
      error: err => {

      }
    });
  }

  ngOnDestroy(): void {
    if (this.destroyed$) {
      this.destroyed$.complete();
      this.destroyed$ = undefined;
    }
  }

}
