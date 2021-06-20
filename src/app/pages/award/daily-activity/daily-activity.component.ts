/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import moment from 'moment';
import { DailyAwardRule, DailyBehavior, OneTimeAwardRule, RuleType, DailyAwardResult, } from 'src/app/models/award';

@Component({
  selector: 'app-daily-activity',
  templateUrl: './daily-activity.component.html',
  styleUrls: ['./daily-activity.component.scss']
})
export class DailyActivityComponent implements OnInit {
  selected: Date | null = null;
  dailyActivities: DailyBehavior[] = [];
  dailyAwardRule: DailyAwardRule[] = [];
  dailyAwardResult: DailyAwardResult[] = [];
  specialAwardRule: OneTimeAwardRule[] = [];
  public itemFormGroup: FormGroup;
  curUser = 'AAA';
  goToBedContinousDays = 0;
  goToBedPoint = 0;
  schoolWorkContinousDays = 0;
  schoolWorkPoint = 0;

  constructor() {
    this.itemFormGroup = new FormGroup({
      // userControl: new FormControl(),
      bedControl: new FormControl(),
      swControl: new FormControl(),
    });
  }

  ngOnInit(): void {
    // Add rules
    let rule = new DailyAwardRule();
    rule.ranges = [{
      taskstart: 18,
      taskend: 21,
      points: [
        { daysFrom: 1, daysTo: 1, point: 1},
        { daysFrom: 2, daysTo: 2, point: 3},
        { daysFrom: 3, daysTo: 3, point: 5},
        { daysFrom: 4, daysTo: 4, point: 8},
        { daysFrom: 5, daysTo: 9999, point: 12},
      ],
    }, {
      taskstart: 21,
      taskend: 22,
      points: [
        { daysFrom: 1, daysTo: 1, point: -1},
        { daysFrom: 2, daysTo: 2, point: -3},
        { daysFrom: 3, daysTo: 3, point: -5},
        { daysFrom: 4, daysTo: 4, point: -8},
        { daysFrom: 5, daysTo: 9999, point: -12},
      ],
    }, {
      taskstart: 22,
      taskend: 23,
      points: [
        { daysFrom: 1, daysTo: 1, point: -5},
        { daysFrom: 2, daysTo: 2, point: -10},
        { daysFrom: 3, daysTo: 3, point: -15},
        { daysFrom: 4, daysTo: 4, point: -20},
        { daysFrom: 5, daysTo: 9999, point: -30},
      ],
    }];
    rule.ruleType = RuleType.goToBedTime;
    this.dailyAwardRule.push(rule);

    rule = new DailyAwardRule();
    rule.ranges = [{
      taskstart: 16,
      taskend: 19,
      points: [
        { daysFrom: 1, daysTo: 1, point: 1},
        { daysFrom: 2, daysTo: 2, point: 3},
        { daysFrom: 3, daysTo: 3, point: 5},
        { daysFrom: 4, daysTo: 4, point: 8},
        { daysFrom: 5, daysTo: 9999, point: 12},
      ],
    }, {
      taskstart: 19,
      taskend: 20,
      points: [
        { daysFrom: 1, daysTo: 1, point: -1},
        { daysFrom: 2, daysTo: 2, point: -3},
        { daysFrom: 3, daysTo: 3, point: -5},
        { daysFrom: 4, daysTo: 4, point: -8},
        { daysFrom: 5, daysTo: 9999, point: -12},
      ],
    }, {
      taskstart: 20,
      taskend: 22,
      points: [
        { daysFrom: 1, daysTo: 1, point: -5},
        { daysFrom: 2, daysTo: 2, point: -10},
        { daysFrom: 3, daysTo: 3, point: -15},
        { daysFrom: 4, daysTo: 4, point: -20},
        { daysFrom: 5, daysTo: 9999, point: -30},
      ],
    }];
    rule.ruleType = RuleType.schoolWorkTime;
    this.dailyAwardRule.push(rule);
  }

  onDateSelected(dat: Date) {
    this.selected = dat;

    // Get record
    const rd = this.getRecord(this.curUser, this.selected);
    if (rd !== null) {
      this.itemFormGroup.get('bedControl')?.setValue(rd.goToBedTime);
      this.itemFormGroup.get('swControl')?.setValue(rd.schoolWorkTime);
    } else {
      this.itemFormGroup.get('bedControl')?.setValue(0);
      this.itemFormGroup.get('swControl')?.setValue(0);
    }
    this.itemFormGroup.markAsPristine();

    // Get result
    const rst = this.getPoint(this.curUser, this.selected);
    if (rst !== null) {
      this.goToBedPoint = rst.goToBedPoint;
      this.schoolWorkPoint = rst.schoolWorkPoint;
      this.goToBedContinousDays = rst.goToBedContinousDays;
      this.schoolWorkContinousDays = rst.schoolWorkContinousDays;
    } else {
      this.goToBedPoint = 0;
      this.schoolWorkPoint = 0;
      this.goToBedContinousDays = 0;
      this.schoolWorkContinousDays = 0;
    }
  }
  onAdd(): void {
    this.itemFormGroup.markAsPristine();
  }
  onEdit(): void {

  }
  onDelete(): void {
  }

  onSave(): void {
    // 1. Save behavior
    const db: DailyBehavior = new DailyBehavior();
    db.currentDate = this.selected;
    // db.user = this.itemFormGroup.get('userControl')?.value;
    db.user = this.curUser;
    db.goToBedTime = this.itemFormGroup.get('bedControl')?.value;
    db.schoolWorkTime = this.itemFormGroup.get('swControl')?.value;
    this.dailyActivities.push(db);

    // 2. Calculate the points.
    // 2.1. Find the last day.
    let prvrst: DailyAwardResult | null = null;
    let prvbeh: DailyBehavior | null = null;
    if (db.currentDate !== null) {
      const curmoment = moment(db.currentDate);
      const prvmoment = curmoment.subtract(1, 'days');
      this.dailyAwardResult.forEach(val => {
        const valmoment = moment(val.currentDate);
        if (val.user === this.curUser && valmoment.isSame(prvmoment, 'day')) {
          prvrst = val;
        }
      });
      this.dailyActivities.forEach(val => {
        const valmoment = moment(val.currentDate!);
        if (val.user === this.curUser && valmoment.isSame(prvmoment, 'day')) {
          prvbeh = val;
        }
      });
    }
    // 2.2 Calculate the points.
    const drst: DailyAwardResult = {
      currentDate: db.currentDate!,
      user: this.curUser,
      goToBedPoint: 0,
      schoolWorkPoint: 0,
      goToBedContinousDays: 0,
      schoolWorkContinousDays: 0,
    };
    this.dailyAwardRule.forEach(val => {
      if (val.ruleType === RuleType.goToBedTime) {
        val.ranges.forEach(range => {
          // Current date
          if (range.taskstart! <= db.goToBedTime && range.taskend! > db.goToBedTime) {
            // Prv day
            if (prvrst !== null && prvbeh !== null && range.taskstart! <= prvbeh?.goToBedTime! && range.taskend! > prvbeh?.goToBedTime!) {
              drst.goToBedContinousDays = prvrst?.goToBedContinousDays! + 1;
            } else {
              drst.goToBedContinousDays = 1;
            }

            range.points.forEach(pnt => {
              if (pnt.daysFrom <= drst.goToBedContinousDays && pnt.daysTo >= drst.goToBedContinousDays) {
                drst.goToBedPoint = pnt.point;
              }
            });
          }
        });
      } else if (val.ruleType === RuleType.schoolWorkTime) {
        val.ranges.forEach(range => {
          // Current date
          if (range.taskstart! <= db.schoolWorkTime && range.taskend! > db.schoolWorkTime) {
            // Prv day
            if (prvrst !== null && prvbeh !== null && range.taskstart! <= prvbeh?.schoolWorkTime!
              && range.taskend! > prvbeh?.schoolWorkTime!) {
              drst.schoolWorkContinousDays = prvrst?.schoolWorkContinousDays! + 1;
            } else {
              drst.schoolWorkContinousDays = 1;
            }

            range.points.forEach(pnt => {
              if (pnt.daysFrom <= drst.schoolWorkContinousDays && pnt.daysTo >= drst.schoolWorkContinousDays) {
                drst.schoolWorkPoint = pnt.point;
              }
            });
          }
        });
      }
    });

    this.goToBedPoint = drst.goToBedPoint;
    this.schoolWorkPoint = drst.schoolWorkPoint;
    this.goToBedContinousDays = drst.goToBedContinousDays;
    this.schoolWorkContinousDays = drst.schoolWorkContinousDays;
    this.dailyAwardResult.push(drst);
  }

  private isRecordExist(usr: string | null, dat: Date | null): boolean {
    let isexist = false;

    this.dailyActivities.forEach(val => {
      if (!isexist) {
        if (val.user === usr && val.currentDate?.getFullYear() === dat?.getFullYear() && val.currentDate?.getMonth() === dat?.getMonth()
          && val.currentDate?.getDate() === dat?.getDate()) {
          isexist = true;
        }
      }
    });

    return isexist;
  }
  private getRecord(usr: string | null, dat: Date | null): DailyBehavior | null {
    let rst: DailyBehavior | null = null;
    this.dailyActivities.forEach(val => {
      if (val.user === usr && val.currentDate?.getFullYear() === dat?.getFullYear() && val.currentDate?.getMonth() === dat?.getMonth()
        && val.currentDate?.getDate() === dat?.getDate()) {
        rst = val;
      }
    });
    return rst;
  }
  private getPoint(usr: string | null, dat: Date | null): DailyAwardResult | null {
    let rst: DailyAwardResult | null = null;
    this.dailyAwardResult.forEach(val => {
      if (val.user === usr && val.currentDate?.getFullYear() === dat?.getFullYear() && val.currentDate?.getMonth() === dat?.getMonth()
        && val.currentDate?.getDate() === dat?.getDate()) {
        rst = val;
      }
    });
    return rst;
  }
}
