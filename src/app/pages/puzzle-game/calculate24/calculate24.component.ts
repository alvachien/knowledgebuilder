import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RPN } from 'actslib';

@Component({
  selector: 'app-calculate24',
  templateUrl: './calculate24.component.html',
  styleUrls: ['./calculate24.component.scss'],
})
export class Calculate24Component implements OnInit {
  isStarted = false;
  Cal24Input = '';
  Cal24items: number[] = [];
  private Cal24NumberRangeBgn = 1;
  private Cal24NumberRangeEnd = 9;
  Cal24SurrendString = '';
  @ViewChild('cal24btntbr', {static: false}) cal24BtnToolbar!: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  /**
   * Cal24 part
   */
  private Cal24(arnum: any[], nlen: number, targetNum: number): boolean {
    const opArr = new Array('+', '-', '*', '/');
    for (let i = 0; i < nlen; i++) {
      for (let j = i + 1; j < nlen; j++) {
        const numij = [arnum[i], arnum[j]];
        arnum[j] = arnum[nlen - 1];
        for (let k = 0; k < opArr.length; k++) {
          const k1: number = k % 2;
          let k2 = 0;
          if (!k1) {
            k2 = 1;
          }
          arnum[i] = '(' + numij[k1] + opArr[k] + numij[k2] + ')';
          if (this.Cal24(arnum, nlen - 1, targetNum)) {
            this.Cal24SurrendString = arnum[0];
            return true;
          }
        }
        arnum[i] = numij[0];
        arnum[j] = numij[1];
      }
    }

    const objRN = new RPN();
    const tmprest = objRN.buildExpress(arnum[0]);
    const result = objRN.WorkoutResult();

    return (nlen === 1) && (result === targetNum);
  }

  public CanCal24Start(): boolean {
    if (this.isStarted) {
      return false;
    }

    return true;
  }

  public OnCal24Start(): void {

    this.Cal24Input = ''; // Clear the inputs
    this.Cal24items = [];

    while (this.Cal24items.length < 4) {
      const nNum = Math.floor(Math.random() * (this.Cal24NumberRangeEnd - this.Cal24NumberRangeBgn)) + this.Cal24NumberRangeBgn;
      const nExistIdx = this.Cal24items.findIndex((val) => { return val === nNum; });
      if (nExistIdx === -1) {
        this.Cal24items.push(nNum);
      }
    }

    // Enable the buttons
    if (this.cal24BtnToolbar) {
      let btnidx = 0;
      for (const btn of this.cal24BtnToolbar.nativeElement.children) {
        if (!this.Cal24items.includes(btnidx + 1)) {
          btn.disabled = true;
        } else {
          btn.disabled = false;
        }

        btnidx ++;
      }
    }
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

    try {
      let realstring = this.Cal24Input.replace('×', '*');
      realstring = realstring.replace('÷', '/');
      rst = <number>eval(realstring);
    } catch (exp) {
      errmsg = exp.toString();
    }

    if (rst !== 24) {
      // const dlginfo: MessageDialogInfo = {
      //   Header: 'Home.Error',
      //   Content: errmsg ? errmsg : (this.Cal24Input + ' = ' + rst.toString() + ' != 24'),
      //   Button: MessageDialogButtonEnum.onlyok
      // };

      // this._dialog.open(MessageDialogComponent, {
      //   disableClose: false,
      //   width: '500px',
      //   data: dlginfo
      // }).afterClosed().subscribe(x => {
      // });
    } else {
    }
  }

  public OnCal24Surrender(): void {
  }
}
