/* eslint-disable quote-props */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { momentDateFormat } from 'src/app/models';
import { AwardRuleGroup, AwardRule, AwardRuleTypeEnum, getAwardRuleTypeName, } from 'src/app/models/award';
import { ODataService, QuizService, UIUtilityService } from 'src/app/services';

@Component({
  selector: 'app-award-rule',
  templateUrl: './award-rule.component.html',
  styleUrls: ['./award-rule.component.scss'],
})
export class AwardRuleComponent implements OnInit {

  dataSource: AwardRuleGroup[] = [];
  displayedColumns: string[] = ['id', 'targetUser', 'ruleType', 'validity', 'desp'];
  recordCount = 0;

  constructor(private odataSrv: ODataService,
    public dialog: MatDialog,
    public uiUtilSrv: UIUtilityService) { }

  ngOnInit(): void {
    this.refreshList();
  }

  get isExpertMode(): boolean {
    return this.odataSrv.expertMode;
  }
  public getAwardRuleTypeName(ruleType: AwardRuleTypeEnum): string {
    return getAwardRuleTypeName(ruleType);
  }

  public onCreateRuleGroup(): void {
    this.uiUtilSrv.navigateAwardRuleGenerationPage();
  }

  public refreshList(): void {
    this.odataSrv.getAwardRuleGroups(100, 0, undefined).subscribe({
      next: val => {
        this.dataSource = val.items.slice();
        this.recordCount = val.totalCount;
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }

  public onCopyRuleGroup(oldgid: number): void {
    // const oldrule = this.originRules.find(p => p.id === oldrid);
    // if (oldrule !== undefined) {
    //   const nrule = new AwardRule();
    //   nrule.copyFrom(oldrule);
    //   const dialogRef = this.dialog.open(AwardRuleCreateDialog, {
    //     width: '600px',
    //     closeOnNavigation: false,
    //     data: nrule,
    //   });

    //   dialogRef.afterClosed().subscribe(result => {
    //     console.log(`The dialog was closed with result: ${result}`);

    //     if (result) {
    //       this.odataSrv.createAwardRule(result).subscribe({
    //         next: val => {
    //           // Refresh the list page
    //           this.refreshList();
    //         },
    //         error: err => {
    //           this.uiUtilSrv.showSnackInfo(err);
    //         }
    //       });
    //     }
    //   });
    // }
  }
  public onDeleteRuleGroup(rid: number): void {
    this.odataSrv.deleteAwardRuleGroup(rid).subscribe({
      next: val => {
        this.refreshList();
      },
      error: err => {
        this.uiUtilSrv.showSnackInfo(err);
      }
    });
  }
}
