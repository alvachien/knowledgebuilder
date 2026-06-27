import type { AfterViewInit, ElementRef, OnInit } from '@angular/core';
import { Component, Input, ViewChild, ViewEncapsulation, inject } from '@angular/core';

import { replaceAtSymbols } from '../../interfaces';
import { KatexService } from '../../services/katex.service';

@Component({
  selector: 'app-mathitem',
  templateUrl: 'mathitem.html',
  styleUrls: ['mathitem.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [],
})
export class MathItemComponent implements OnInit, AfterViewInit {
  @Input({ required: true }) valuestr = '';
  @Input({ required: true }) version = 1;
  @Input({ required: true }) testmode = false;
  @ViewChild('mathContainer') mathContainer!: ElementRef;

  _html: {
    type: string;
    value: string;
  }[] = [];
  newvaluestr = '';

  private readonly katexService = inject(KatexService);

  constructor() {}

  ngOnInit() {
    if (this.valuestr) {
      if (this.version === 2) {
        if (this.testmode) {
          // Print mode
          this.newvaluestr = replaceAtSymbols(this.valuestr, '<u>&nbsp;</u>');
        } else {
          // Display mode
          this.newvaluestr = this.valuestr.replaceAll('@', '');
        }
      } else {
        if (this.testmode) {
          // Print mode
          this.newvaluestr = '__'.repeat(this.valuestr.length);
        } else {
          this.newvaluestr = this.valuestr;
        }
      }
      return;
    }
  }

  ngAfterViewInit(): void {
    void this.renderMathInElement(this.mathContainer.nativeElement);
  }

  async renderMathInElement(element: HTMLElement) {
    await this.katexService.renderMathInElement(element, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true },
      ],
      throwOnError: false,
    });
  }
}
