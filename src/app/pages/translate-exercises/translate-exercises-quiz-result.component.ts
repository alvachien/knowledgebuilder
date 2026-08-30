import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@jsverse/transloco';

import { TranslateQuizSessionStore } from './translate-exercises-quiz-session.store';

/**
 * Quiz-result screen of the sentence page: the score line and the
 * per-sentence correctness table, both read from the shared session store.
 */
@Component({
  selector: 'app-translate-exercises-quiz-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    TranslocoModule,
  ],
  templateUrl: './translate-exercises-quiz-result.component.html',
  styleUrl: './translate-exercises-quiz-result.component.scss',
})
export class TranslateExercisesQuizResultComponent {
  protected readonly store = inject(TranslateQuizSessionStore);

  readonly backToList = output<void>();

  displayedColumns: string[] = ['ensent', 'cnsent', 'correct'];
}
