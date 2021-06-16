/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
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
    rule.range = {
      taskstart: 18,
      taskend: 21,
    };
    rule.ruleType = RuleType.goToBedTime;
    rule.points.push({ days: 1, point: 1});
    rule.points.push({ days: 2, point: 3});
    rule.points.push({ days: 3, point: 5});
    rule.points.push({ days: 4, point: 8});
    rule.points.push({ days: 5, point: 12});
    this.dailyAwardRule.push(rule);

    rule = new DailyAwardRule();
    rule.range = {
      taskstart: 16,
      taskend: 19,
    };
    rule.ruleType = RuleType.schoolWorkTime;
    rule.points.push({ days: 1, point: 1});
    rule.points.push({ days: 2, point: 3});
    rule.points.push({ days: 3, point: 5});
    rule.points.push({ days: 4, point: 8});
    rule.points.push({ days: 5, point: 12});
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
    const db: DailyBehavior = new DailyBehavior();
    db.currentDate = this.selected;
    // db.user = this.itemFormGroup.get('userControl')?.value;
    db.user = this.curUser;
    db.goToBedTime = this.itemFormGroup.get('bedControl')?.value;
    db.schoolWorkTime = this.itemFormGroup.get('swControl')?.value;

    if (this.isRecordExist(db.user, db.currentDate)) {
      alert('Existed');
    }

    this.dailyActivities.push(db);

    // Calculate the points if necessary
    let bNeedCal = false;
    this.dailyAwardRule.forEach(val => {
      if (val.ruleType === RuleType.goToBedTime) {
        if (val.range?.taskstart! <= db.goToBedTime && val.range?.taskend! >= db.goToBedTime) {
          bNeedCal = true;
        }
      } else if (val.ruleType === RuleType.schoolWorkTime) {
        if (val.range?.taskstart! <= db.schoolWorkTime && val.range?.taskend! >= db.schoolWorkTime) {
          bNeedCal = true;
        }
      }
    });

    if (bNeedCal) {
      // 1. Find the last day.
      let prv: DailyAwardResult | null = null;
      if (db.currentDate !== null) {
        const prvdate = new Date(db.currentDate?.getTime() - 1000*60*60*24);
        this.dailyAwardResult.forEach(val => {
          if (val.user === this.curUser && val.currentDate?.getFullYear() === prvdate?.getFullYear()
            && val.currentDate?.getMonth() === prvdate?.getMonth()
            && val.currentDate?.getDate() === prvdate?.getDate()) {
            prv = val;
          }
        });
      }
      // 2. Update the today;
      if (prv) {
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
            if (val.range?.taskstart! <= db.goToBedTime && val.range?.taskend! >= db.goToBedTime) {
              for (let i = 0; i < val.points.length; i ++) {
                if (val.points[i].days === prv?.goToBedContinousDays! + 1) {
                  drst.goToBedContinousDays = val.points[i].days;
                  drst.goToBedPoint = val.points[i].point;
                }
              }
            }
          } else if (val.ruleType === RuleType.schoolWorkTime) {
            if (val.range?.taskstart! <= db.schoolWorkTime && val.range?.taskend! >= db.schoolWorkTime) {
              for (let i = 0; i < val.points.length; i ++) {
                if (val.points[i].days === prv?.schoolWorkContinousDays! + 1) {
                  drst.schoolWorkContinousDays = val.points[i].days;
                  drst.schoolWorkPoint = val.points[i].point;
                }
              }
            }
          }
        });

        this.goToBedPoint = drst.goToBedPoint;
        this.schoolWorkPoint = drst.schoolWorkPoint;
        this.goToBedContinousDays = drst.goToBedContinousDays;
        this.schoolWorkContinousDays = drst.schoolWorkContinousDays;
        this.dailyAwardResult.push(drst);
      } else {
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
            if (val.range?.taskstart! <= db.goToBedTime && val.range?.taskend! >= db.goToBedTime) {
              val.points.forEach(pnt => {
                if (pnt.days === 1) {
                  drst.goToBedContinousDays = 1;
                  drst.goToBedPoint = pnt.point;
                }
              });
            }
          } else if (val.ruleType === RuleType.schoolWorkTime) {
            if (val.range?.taskstart! <= db.schoolWorkTime && val.range?.taskend! >= db.schoolWorkTime) {
              val.points.forEach(pnt => {
                if (pnt.days === 1) {
                  drst.schoolWorkContinousDays = 1;
                  drst.schoolWorkPoint = pnt.point;
                }
              });
            }
          }
        });

        this.goToBedPoint = drst.goToBedPoint;
        this.schoolWorkPoint = drst.schoolWorkPoint;
        this.goToBedContinousDays = drst.goToBedContinousDays;
        this.schoolWorkContinousDays = drst.schoolWorkContinousDays;
        this.dailyAwardResult.push(drst);
      }
      // 3. Update the following days;
    } else {
      const drst: DailyAwardResult = {
        currentDate: db.currentDate!,
        user: this.curUser,
        goToBedPoint: 0,
        schoolWorkPoint: 0,
        goToBedContinousDays: 1,
        schoolWorkContinousDays: 1,
      };
      this.dailyAwardResult.push(drst);

      this.goToBedPoint = 0;
      this.schoolWorkPoint = 0;
      this.goToBedContinousDays = 0;
      this.schoolWorkContinousDays = 0;
    }
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
