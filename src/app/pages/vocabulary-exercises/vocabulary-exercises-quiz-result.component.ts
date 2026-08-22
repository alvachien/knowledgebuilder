import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@jsverse/transloco';

import { VocabularyQuizSessionStore } from './vocabulary-exercises-quiz-session.store';

/**
 * Test-result screen of the vocabulary exercises page: the score line and the
 * per-word correctness table, both read from the shared session store.
 */
@Component({
  selector: 'app-vocabulary-exercises-quiz-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises-quiz-result.component.html',
  styleUrl: './vocabulary-exercises-quiz-result.component.scss',
})
export class VocabularyExercisesQuizResultComponent {
  protected readonly store = inject(VocabularyQuizSessionStore);

  readonly backToList = output<void>();

  displayedColumns: string[] = ['word', 'chinese', 'correct'];
}
