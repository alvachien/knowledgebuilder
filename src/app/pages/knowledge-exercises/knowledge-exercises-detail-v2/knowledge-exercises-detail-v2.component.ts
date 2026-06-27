import type { AfterViewInit, OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxPrintModule } from 'ngx-print';

import type { KnowledgeExercisePrintOption, QuestionBankItemBase } from '../../../interfaces';
import {
  convertQuestionBankItemToMarkdown,
  convertQuestionBankItemAnswerToMarkdown,
} from '../../../interfaces';
import { StorageService, UIService } from '../../../services';
import { MarkdownContentComponent } from '../../../shared/markdown-content';

@Component({
  selector: 'app-knowledge-exercises-detail-v2',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    FormsModule,
    NgxPrintModule,
    MarkdownContentComponent,
  ],
  templateUrl: './knowledge-exercises-detail-v2.component.html',
  styleUrl: './knowledge-exercises-detail-v2.component.scss',
  host: {
    class: 'app-main-content',
  },
})
export class KnowledgeExercisesDetailV2Component implements OnInit, AfterViewInit {
  questions: QuestionBankItemBase<string>[] = [];
  printSetting?: KnowledgeExercisePrintOption;
  isPrintMode = model(false);
  readonly storageService = inject(StorageService);
  readonly uiService = inject(UIService);
  markdownStr = '';
  markdownAdditionStr = '';
  includeLatex = false;
  printID = new Date().toISOString();

  constructor() {}

  ngOnInit() {
    this.questions = this.uiService.ExerciseItems;
    this.printSetting = this.uiService.ExercisePrintSetting;
    this.includeLatex = this.uiService.IncludeLatex;
  }

  /** Base URL for resolving relative image paths in the current exercise content. */
  get imageBaseUrl(): string | undefined {
    return this.uiService.CurrentExerciseImageBaseUrl;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.markdownStr = `### **${this.printSetting?.formTitle}**, (${this.printID})<br>
 ${this.printSetting?.printScore ? 'Date: <ins>&emsp;&emsp;&emsp;&emsp;&emsp;</ins>' : ''}&emsp;Durtion: <ins>&emsp;&emsp;&emsp;&emsp;&emsp;</ins>${this.printSetting?.printScore ? '&emsp; Score: <ins>&emsp;&emsp;&emsp;&emsp;</ins>' : ''}<br>
 `;
      this.questions.forEach((item, _idx) => {
        this.markdownStr +=
          convertQuestionBankItemToMarkdown(
            item,
            this.printSetting?.hideLabelOfQuestionType,
            this.printSetting?.printID
          ) + '\n';
        //(idx === this.questions.length - 1 ? '' : '\n');
      });

      if (this.printSetting?.printAnswer) {
        this.markdownAdditionStr = `### **${this.printSetting?.formTitle}**, (${this.printID})\n`;
        this.questions.forEach((item, idx) => {
          this.markdownAdditionStr +=
            convertQuestionBankItemAnswerToMarkdown(item) +
            (this.printSetting?.printHintOfAnswer && item.hintofanswer
              ? `; &emsp;${item.hintofanswer}; `
              : '') +
            (idx === this.questions.length - 1 ? '' : '&emsp;');
        });
      }
    }, 0);
  }
}
