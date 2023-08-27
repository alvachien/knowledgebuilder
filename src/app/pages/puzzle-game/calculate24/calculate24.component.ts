import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ResultDialogComponent } from '../result-dialog/result-dialog.component';
import { FormulaParser } from 'actslib';

@Component({
  selector: 'khb-calculate24',
  templateUrl: './calculate24.component.html',
  styleUrls: ['./calculate24.component.scss'],
})
export class Calculate24Component {
  isStarted = false;
  Cal24Input = '';
  Cal24items: number[] = [];
  private Cal24NumberRangeBgn = 1;
  private Cal24NumberRangeEnd = 10;
  Cal24SurrendString = '';

  constructor(public dialog: MatDialog) {}

  public CanCal24Start(): boolean {
    if (this.isStarted) {
      return false;
    }

    return true;
  }

  public IsButtonDisabled(num: number): boolean {
    if (!this.isStarted) {
      return true;
    }
    return !this.Cal24items.includes(num);
  }
  public OnCal24Start(): void {
    this.Cal24Input = ''; // Clear the inputs
    this.Cal24items = [];

    while (this.Cal24items.length < 4) {
      let nNum =
        Math.round(Math.random() * (this.Cal24NumberRangeEnd - this.Cal24NumberRangeBgn)) + this.Cal24NumberRangeBgn;
      if (nNum > this.Cal24NumberRangeEnd) {
        nNum = this.Cal24NumberRangeEnd;
      } else if(nNum < this.Cal24NumberRangeBgn) {
        nNum = this.Cal24NumberRangeBgn;
      }
      const nExistIdx = this.Cal24items.findIndex((val) => val === nNum);
      if (nExistIdx === -1) {
        this.Cal24items.push(nNum);
      }
    }

    this.isStarted = true;
  }

  public CanCal24Submit(): boolean {
    if (!this.isStarted) {
      return false;
    }
    if (this.Cal24Input.length <= 0) {
      return false;
    }

    return true;
  }

  public OnCal24Append(char: string): void {
    this.Cal24Input += char;
  }
  public OnCal24Backspace(): void {
    if (this.Cal24Input.length > 1) {
      this.Cal24Input = this.Cal24Input.substring(0, this.Cal24Input.length - 1);
    } else {
      this.Cal24Input = '';
    }
  }
  public OnCal24Reset(): void {
    this.Cal24Input = '';
  }

  public OnCal24Submit(): void {
    let rst = 0;
    let errmsg = '';
    let retry = false;
    let isWin = false;

    try {
      let realstring = this.Cal24Input.replace('×', '*');
      realstring = realstring.replace('÷', '/');

      let insForm: FormulaParser = new FormulaParser();
      insForm.init(realstring);
      rst = insForm.evaulate();
      if (rst !== 24) {
        //  Lose
      } else {
        isWin = true;
      }
    } catch (exp) {
      isWin = false;

      errmsg = exp?.toString() ?? '';
      if (errmsg) {
        // TBD
      }
    }

    const dialogRef = this.dialog.open(ResultDialogComponent, {
      width: '300px',
      data: { youWin: isWin },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      retry = result;
      if (retry) {
        this.OnCal24Start();
      } else {
        this.isStarted = false;
      }
    });
  }

  public OnCal24Surrender(): void {
    // Surrender
    let retry = false;
    const dialogRef = this.dialog.open(ResultDialogComponent, {
      width: '300px',
      data: { youWin: false },
    });
    dialogRef.afterClosed().subscribe((result) => {
      retry = result;
      if (retry) {
        this.OnCal24Start();
      } else {
        this.isStarted = false;
      }
    });
  }
}
