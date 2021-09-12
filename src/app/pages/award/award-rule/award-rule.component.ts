/* eslint-disable quote-props */
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { momentDateFormat } from 'src/app/models';
import { AwardRule, AwardRuleTypeEnum, getAwardRuleTypeNames, } from 'src/app/models/award';
import { ODataService, QuizService } from 'src/app/services';

export interface AwardTimeRuleUI {
  id: number;
  targetUser: string;
  point: number;
  validity: string;
  countOfDays: string;
  timeRange: string;
}

export interface AwardCountRuleUI {
  id: number;
  targetUser: string;
  point: number;
  validity: string;
  countOfDays: string;
  countRange: string;
}

export interface AwardBitRuleUI {
  id: number;
  targetUser: string;
  point: number;
  validity: string;
  countOfDays: string;
  value: string;
}

@Component({
  selector: 'app-award-rule',
  templateUrl: './award-rule.component.html',
  styleUrls: ['./award-rule.component.scss'],
})
export class AwardRuleComponent implements OnInit {

  dataSourceGoToBedRule: AwardTimeRuleUI[] = [];
  displayedTimeRuleColumns: string[] = ['id', 'targetUser', 'point', 'validity', 'timeRange', 'countOfDays'];
  goToBedRulesLength = 0;
  dataSourceSchoolWorkRule: AwardTimeRuleUI[] = [];
  schoolWorkRulesLength = 0;
  displayedCountRuleColumns: string[] = ['id', 'targetUser', 'point', 'validity', 'countRange', 'countOfDays'];
  dataSourceHomeworkRule: AwardCountRuleUI[] = [];
  homeWorkRulesLength = 0;
  dataSourceBodyExerciseRule: AwardCountRuleUI[] = [];
  bodyExerciseRuleLength = 0;
  dataSourceHouseKeepingRule: AwardCountRuleUI[] = [];
  houseKeepingRuleLength = 0;
  displayedBitRuleColumns: string[] = ['id', 'targetUser', 'point', 'validity', 'value', 'countOfDays'];
  dataSourceErrorCollectionRule: AwardBitRuleUI[] = [];
  errorCollectionRuleLength = 0;
  dataSourceHandwritingRule: AwardBitRuleUI[] = [];
  handwritingRuleLength = 0;
  dataSourceCleanDeskRule: AwardBitRuleUI[] = [];
  cleanDeskRuleLength = 0;
  dataSourcePoliteBehaviorRule: AwardCountRuleUI[] = [];
  politeBehaviorRuleLength = 0;
  originRules: AwardRule[] = [];

  constructor(private odataSrv: ODataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.refreshList();
  }

  get isExpertMode(): boolean {
    return this.odataSrv.expertMode;
  }

  public onCreateRule(): void {
    const dialogRef = this.dialog.open(AwardRuleCreateDialog, {
      width: '600px',
      closeOnNavigation: false,
      data: new AwardRule(),
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed with result: ${result}`);

      if (result) {
        this.odataSrv.createAwardRule(result).subscribe({
          next: val => {
            // Refresh the list page
            this.refreshList();
          },
          error: err => {
            this.snackBar.open(err, undefined, { duration: 2000 });
          }
        });
      }
    });
  }
  public onCreateRuleEx(): void {
    const dialogRef = this.dialog.open(AwardRuleCreateExDialog, {
      width: '600px',
      closeOnNavigation: false,
      data: [],
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`The dialog was closed with result: ${result}`);

      if (result) {
        // this.odataSrv.createAwardRule(result).subscribe({
        //   next: val => {
        //     // Refresh the list page
        //     this.refreshList();
        //   },
        //   error: err => {
        //     this.snackBar.open(err, undefined, { duration: 2000 });
        //   }
        // });
      }
    });
  }

  public refreshList(): void {
    this.odataSrv.getAwardRules(100, 0, undefined).subscribe({
      next: val => {
        this.originRules = val.items.slice();
        this.dataSourceGoToBedRule = [];
        this.dataSourceSchoolWorkRule = [];
        this.dataSourceBodyExerciseRule = [];
        this.dataSourceCleanDeskRule = [];
        this.dataSourceErrorCollectionRule = [];
        this.dataSourceHandwritingRule = [];
        this.dataSourceHomeworkRule = [];
        this.dataSourceHouseKeepingRule = [];
        this.dataSourcePoliteBehaviorRule = [];

        this.originRules.forEach(item => {
          if (item.ruleType === AwardRuleTypeEnum.GoToBedTime) {
            const nrule: AwardTimeRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              timeRange: item.timeStart?.toString() + ' - ' + item.timeEnd?.toString(),
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceGoToBedRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.SchoolWorkTime) {
            const nrule: AwardTimeRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              timeRange: item.timeStart?.toString() + ' - ' + item.timeEnd?.toString(),
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceSchoolWorkRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.HomeWorkCount) {
            const nrule: AwardCountRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              countRange: item.countOfFactLow?.toString() + ' - ' + item.countOfFactHigh?.toString(),
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceHomeworkRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.BodyExerciseCount) {
            const nrule: AwardCountRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              countRange: item.countOfFactLow?.toString() + ' - ' + item.countOfFactHigh?.toString(),
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceBodyExerciseRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.HouseKeepingCount) {
            const nrule: AwardCountRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              countRange: item.countOfFactLow?.toString() + ' - ' + item.countOfFactHigh?.toString(),
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceHouseKeepingRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.PoliteBehavior) {
            const nrule: AwardCountRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              countRange: item.countOfFactLow?.toString() + ' - ' + item.countOfFactHigh?.toString(),
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourcePoliteBehaviorRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.ErrorCollectionHabit) {
            const nrule: AwardBitRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              value: item.doneOfFact ? item.doneOfFact.toString() : '',
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceErrorCollectionRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.HandWritingHabit) {
            const nrule: AwardBitRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              value: item.doneOfFact ? item.doneOfFact.toString() : '',
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceHandwritingRule.push(nrule);
          } else if (item.ruleType === AwardRuleTypeEnum.CleanDeakHabit) {
            const nrule: AwardBitRuleUI = {
              id: item.id,
              targetUser: item.targetUser,
              point: item.point,
              validity: item.validFrom.format(momentDateFormat) + ' - ' + item.validTo.format(momentDateFormat),
              value: item.doneOfFact ? item.doneOfFact.toString() : '',
              countOfDays: item.daysFrom?.toString() + ' - ' + item.daysTo?.toString(),
            };
            this.dataSourceCleanDeskRule.push(nrule);
          }

          this.goToBedRulesLength = this.dataSourceGoToBedRule.length;
          this.schoolWorkRulesLength = this.dataSourceSchoolWorkRule.length;
          this.homeWorkRulesLength = this.dataSourceHomeworkRule.length;
          this.bodyExerciseRuleLength = this.dataSourceBodyExerciseRule.length;
          this.houseKeepingRuleLength = this.dataSourceHouseKeepingRule.length;
          this.errorCollectionRuleLength = this.dataSourceErrorCollectionRule.length;
          this.handwritingRuleLength = this.dataSourceHandwritingRule.length;
          this.cleanDeskRuleLength = this.dataSourceCleanDeskRule.length;
          this.politeBehaviorRuleLength = this.dataSourcePoliteBehaviorRule.length;
        });
      },
      error: err => {
        this.snackBar.open(err, undefined, { duration: 2000 });
      }
    });
  }

  public onCopyRule(oldrid: number): void {
    const oldrule = this.originRules.find(p => p.id === oldrid);
    if (oldrule !== undefined) {
      const nrule = new AwardRule();
      nrule.copyFrom(oldrule);
      const dialogRef = this.dialog.open(AwardRuleCreateDialog, {
        width: '600px',
        closeOnNavigation: false,
        data: nrule,
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log(`The dialog was closed with result: ${result}`);

        if (result) {
          this.odataSrv.createAwardRule(result).subscribe({
            next: val => {
              // Refresh the list page
              this.refreshList();
            },
            error: err => {
              this.snackBar.open(err, undefined, { duration: 2000 });
            }
          });
        }
      });
    }
  }
  public onDeleteRule(rid: number): void {
    this.odataSrv.deleteAwardRule(rid).subscribe({
      next: val => {
        this.refreshList();
      },
      error: err => {
        this.snackBar.open(err, undefined, { duration: 2000 });
      }
    });
  }
}

@Component({
  selector: 'app-award-rule-create-dialog',
  templateUrl: 'award-rule-create.dialog.html',
  styleUrls: ['./award-rule.component.scss'],
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class AwardRuleCreateDialog {

  arRuleTypes: any[] = [];
  get isTimeRangeNeed(): boolean {
    return this.data.ruleType === AwardRuleTypeEnum.GoToBedTime
      || this.data.ruleType === AwardRuleTypeEnum.SchoolWorkTime;
  }
  get isCountNeed(): boolean {
    return this.data.ruleType === AwardRuleTypeEnum.HomeWorkCount
      || this.data.ruleType === AwardRuleTypeEnum.HouseKeepingCount
      || this.data.ruleType === AwardRuleTypeEnum.PoliteBehavior
      || this.data.ruleType === AwardRuleTypeEnum.BodyExerciseCount;
  }
  get isDoneNeed(): boolean {
    return this.data.ruleType === AwardRuleTypeEnum.CleanDeakHabit
      || this.data.ruleType === AwardRuleTypeEnum.ErrorCollectionHabit
      || this.data.ruleType === AwardRuleTypeEnum.HandWritingHabit;
  }

  constructor(public dialogRef: MatDialogRef<AwardRuleCreateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: AwardRule) {
    this.arRuleTypes = getAwardRuleTypeNames();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-award-rule-create-ex-dialog',
  templateUrl: 'award-rule-create-ex.dialog.html',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class AwardRuleCreateExDialog {
  displayedColumns: string[] = ['desp', 'validFrom', 'validTo', 'countOfFactLow', 'countOfFactHigh', 'timeStart', 'timeEnd',
    'daysFrom', 'daysTo', 'point', 'edit'];
  dataSource: AwardRule[] = [];
  dataSchema: { [key: string]: any } = {
    // ruleType: AwardRuleTypeEnum = AwardRuleTypeEnum.GoToBedTime;
    // 'targetUser': 'text',
    'desp': 'text',
    'validFrom': 'date',
    'validTo': 'date',
    'countOfFactLow': 'number',
    'countOfFactHigh': 'number',
    // 'doneOfFact': 'boolean',
    'timeStart': 'number',
    'timeEnd': 'number',
    'daysFrom': 'number',
    'daysTo': 'number',
    'point': 'number',
    'edit': 'edit',
  };

  constructor(public dialogRef: MatDialogRef<AwardRuleCreateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any[]) {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
