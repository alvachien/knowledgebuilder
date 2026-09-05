import {
  Component,
  Inject,
  DestroyRef,
  inject,
  model,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { TranslationAIModeEnum } from '../../interfaces';
import { AIService } from '../../services';

@Component({
  selector: 'app-translate-exercises-llm-dlg',
  templateUrl: './translate-exercises-llm-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatSelectModule,
    MatDialogContent,
    MatDialogActions,
    TranslocoModule,
  ],
})
export class TranslateExercisesLLMDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TranslateExercisesLLMDialogComponent>);
  readonly mode = model(TranslationAIModeEnum.Explain);
  readonly trans = model('');
  readonly aireply = model('');
  readonly transloco = inject(TranslocoService);
  readonly aiutil = inject(AIService);
  private readonly destroyRef = inject(DestroyRef);
  allAIModes = [{ value: TranslationAIModeEnum.Explain }, { value: TranslationAIModeEnum.Correct }];

  getAIModeName(mode: TranslationAIModeEnum): string {
    switch (mode) {
      case TranslationAIModeEnum.Explain:
        return this.transloco.translate('explain');
      default:
        return this.transloco.translate('translateExercises.correct');
    }
  }

  get isTranslationModeCorrection(): boolean {
    return this.mode() === TranslationAIModeEnum.Correct;
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: { orgsent: string }) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.mode() === TranslationAIModeEnum.Explain) {
      this.aiutil
        .explainSentence(`请从词汇、语法角度讲解一下'${this.data.orgsent}'，返回长度控制在100字。`)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data: any) => {
            this.aireply.set(data.content);
          },
          error: err => {
            console.error(err);
          },
        });
    } else if (this.mode() === TranslationAIModeEnum.Correct) {
      this.aiutil
        .explainSentence(
          `英文原文：'${this.data.orgsent}'，我的翻译为'${this.trans()}', 请从词汇语法角度分析翻译是否正确。返回长度控制在100字。`
        )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (data: any) => {
            this.aireply.set(data.content);
          },
          error: err => {
            console.error(err);
          },
        });
    }
  }
}
