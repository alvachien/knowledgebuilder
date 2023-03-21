import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

export interface typingCompare {
  expected: string;
  inputted: string;
}

@Component({
  selector: 'app-typing-game',
  templateUrl: './typing-game.component.html',
  styleUrls: ['./typing-game.component.scss'],
})
export class TypingGameComponent implements OnInit, AfterViewInit {
  @ViewChild('expword', { static: true }) expWordER!: ElementRef;
  @ViewChild('inpword', { static: true }) inpWordER!: ElementRef;
  @ViewChild('inpword2', { static: true }) inpWord2ER!: ElementRef;
  @ViewChild('keyboard', { static: true }) keyboardER!: ElementRef;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() finishEvent: EventEmitter<any> = new EventEmitter();
  public expectedString = '';
  public inputtedString: string | null = '';
  public fakedContent = '';

  arComparison: typingCompare[] = [];
  currHittingKeyID: string;

  constructor() {
    this.currHittingKeyID = '';
  }

  ngOnInit(): void {
    this.inputtedString = '';
    this.generateExpectedString();
    this.updateComparison();
  }

  ngAfterViewInit(): void {
    this.inpWordER.nativeElement.addEventListener('focus', () => {
      this.inpWord2ER.nativeElement.focus();
    });

    this.inpWord2ER.nativeElement.focus();
  }

  private updateComparison(isdelta?: boolean) {
    if (isdelta) {
      const nlen = this.inputtedString?.length ?? 0;
      let issucc = true;

      if (nlen !== this.arComparison.length) {
        issucc = false;
      }
      for (let i = 0; i < nlen; i++) {
        this.arComparison[i].inputted = this.inputtedString?.charAt(i) ?? '';

        if (issucc) {
          if (this.arComparison[i].expected !== (this.inputtedString?.charAt(i) ?? '')) {
            issucc = false;
          }
        }
      }

      if (issucc) {
        // Completed.
        this.finishEvent.emit(null);
      }

      for (let i: number = nlen; i < this.arComparison.length; i++) {
        this.arComparison[i].inputted = '';
      }

      // There still room to improve performance!
      // Todo!
      if (this.inpWordER !== null && this.inpWordER !== undefined) {
        let nhtml = '';
        for (const cmp of this.arComparison) {
          if (cmp.inputted !== null && cmp.inputted !== cmp.expected) {
            nhtml += '<span style="color: #FF0000;">' + cmp.inputted + '</span>';
          } else if (cmp.inputted !== null) {
            nhtml += '<span>' + cmp.inputted + '</span>';
          }
        }
        // if (environment.LoggingLevel >= LogLevel.Debug) {
        //   console.log('AC Math Exercise [Debug]: Entering updateComparison of PgTypingTourComponent with DELTA: ' + nhtml);
        // }

        this.inpWordER.nativeElement.innerHTML = nhtml;
      }
    } else {
      if (this.expectedString !== undefined && this.expectedString.length > 0) {
        this.arComparison = [];
        for (const c of this.expectedString) {
          const tc: typingCompare = {
            expected: c,
            inputted: '',
          };
          this.arComparison.push(tc);
        }

        if (this.expWordER !== null && this.expWordER !== undefined) {
          let nhtml = '';
          for (const c of this.expectedString) {
            nhtml += '<span>' + c + '</span>';
          }

          this.expWordER.nativeElement.innerHTML = nhtml;
        }
      }
    }
  }
  private generateExpectedString() {
    let basic = 'abcdefghijklmnopqrstuvwxyz';
    // if (this.typingIncCaptial) {
    basic = basic + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    // }
    // if (this.typingIncNumber) {
    basic = basic + '0123456789';
    // }
    // if (this.typingIncSymbols) {
    //   basic = basic + ',.;\'`!@#$%^&*()_+-=[]{}\|<>?:';
    // }

    this.expectedString = '';
    for (let i = 0; i < 20; i++) {
      const word = basic.charAt(Math.floor(Math.random() * basic.length));
      this.expectedString += word;
    }
  }

  @HostListener('keydown', ['$event'])
  public onPGTypingTourKeyDown(evt: KeyboardEvent) {
    // https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/key/Key_Values
    // Any other input? Prevent the default response:
    if (evt.preventDefault) {
      evt.preventDefault();
    }

    if (evt.key === 'Backspace') {
      if ((this.inputtedString ?? '').length >= 2) {
        this.inputtedString = (this.inputtedString ?? '').slice(0, length - 2);
      } else {
        this.inputtedString = '';
      }

      this.updateComparison(true);
    } else if (
      '`1234567890-=~!@#$%^&*()_+[]\\{}|;\':",./<>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(
        evt.key
      ) !== -1
    ) {
      if (this.keyboardER !== null && this.keyboardER !== undefined) {
        const kid = this.getElementIDByKey(evt.key);
        if (kid !== undefined && kid.length > 0) {
          this.currHittingKeyID = kid;
          this.keyboardER.nativeElement.querySelector('#' + kid).classList.add('keyhitting');
        }
      }

      this.inputtedString = this.inputtedString + evt.key;

      this.updateComparison(true);
    }
  }

  @HostListener('keyup', ['$event'])
  public onPGTypingTourKeyUp(evt: KeyboardEvent) {
    if (this.keyboardER !== null && this.keyboardER !== undefined) {
      if (this.currHittingKeyID !== undefined && this.currHittingKeyID.length > 0) {
        this.keyboardER.nativeElement.querySelector('#' + this.currHittingKeyID).classList.remove('keyhitting');
      }
    }
  }

  private getElementIDByKey(ks: string) {
    if ('`~'.indexOf(ks) !== -1) {
      return 'keykeybackquote';
    } else if ('1!'.indexOf(ks) !== -1) {
      return 'key1';
    } else if ('2@'.indexOf(ks) !== -1) {
      return 'key2';
    } else if ('3#'.indexOf(ks) !== -1) {
      return 'key3';
    } else if ('4$'.indexOf(ks) !== -1) {
      return 'key4';
    } else if ('5%'.indexOf(ks) !== -1) {
      return 'key5';
    } else if ('6^'.indexOf(ks) !== -1) {
      return 'key6';
    } else if ('7&'.indexOf(ks) !== -1) {
      return 'key7';
    } else if ('8*'.indexOf(ks) !== -1) {
      return 'key8';
    } else if ('9('.indexOf(ks) !== -1) {
      return 'key9';
    } else if ('0)'.indexOf(ks) !== -1) {
      return 'key0';
    } else if ('-_'.indexOf(ks) !== -1) {
      return 'keyminus';
    } else if ('=+'.indexOf(ks) !== -1) {
      return 'keyequal';
    } else if ('qQ'.indexOf(ks) !== -1) {
      return 'keyq';
    } else if ('wW'.indexOf(ks) !== -1) {
      return 'keyw';
    } else if ('eE'.indexOf(ks) !== -1) {
      return 'keye';
    } else if ('rR'.indexOf(ks) !== -1) {
      return 'keyr';
    } else if ('tT'.indexOf(ks) !== -1) {
      return 'keyt';
    } else if ('Yy'.indexOf(ks) !== -1) {
      return 'keyy';
    } else if ('uU'.indexOf(ks) !== -1) {
      return 'keyu';
    } else if ('iI'.indexOf(ks) !== -1) {
      return 'keyi';
    } else if ('oO'.indexOf(ks) !== -1) {
      return 'keyo';
    } else if ('pP'.indexOf(ks) !== -1) {
      return 'keyp';
    } else if ('[{'.indexOf(ks) !== -1) {
      return 'keyleftbr';
    } else if (']}'.indexOf(ks) !== -1) {
      return 'keyrightbr';
    } else if ('|\\'.indexOf(ks) !== -1) {
      return 'keybackslash';
    } else if ('aA'.indexOf(ks) !== -1) {
      return 'keya';
    } else if ('sS'.indexOf(ks) !== -1) {
      return 'keys';
    } else if ('dD'.indexOf(ks) !== -1) {
      return 'keyd';
    } else if ('fF'.indexOf(ks) !== -1) {
      return 'keyf';
    } else if ('gG'.indexOf(ks) !== -1) {
      return 'keyg';
    } else if ('hH'.indexOf(ks) !== -1) {
      return 'keyh';
    } else if ('jJ'.indexOf(ks) !== -1) {
      return 'keyj';
    } else if ('kK'.indexOf(ks) !== -1) {
      return 'keyk';
    } else if ('lL'.indexOf(ks) !== -1) {
      return 'keyl';
    } else if (';:'.indexOf(ks) !== -1) {
      return 'keysemicolon';
    } else if ('\'"'.indexOf(ks) !== -1) {
      return 'keyquote';
    } else if ('zZ'.indexOf(ks) !== -1) {
      return 'keyz';
    } else if ('xX'.indexOf(ks) !== -1) {
      return 'keyx';
    } else if ('cC'.indexOf(ks) !== -1) {
      return 'keyc';
    } else if ('vV'.indexOf(ks) !== -1) {
      return 'keyv';
    } else if ('bB'.indexOf(ks) !== -1) {
      return 'keyb';
    } else if ('nN'.indexOf(ks) !== -1) {
      return 'keyn';
    } else if ('mM'.indexOf(ks) !== -1) {
      return 'keym';
    } else if ('<,'.indexOf(ks) !== -1) {
      return 'keycomma';
    } else if ('>.'.indexOf(ks) !== -1) {
      return 'keydot';
    } else if ('/?'.indexOf(ks) !== -1) {
      return 'keyslash';
    }

    return undefined;
  }
}
