import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@jsverse/transloco';

import { VocabularySpellingSessionStore } from './vocabulary-exercises-spelling-session.store';

/**
 * Typing-result screen of the vocabulary exercises page: the score line and
 * the per-word correctness table, both read from the shared session store.
 */
@Component({
  selector: 'app-vocabulary-exercises-spelling-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises-spelling-result.component.html',
  styleUrl: './vocabulary-exercises-spelling-result.component.scss',
})
export class VocabularyExercisesSpellingResultComponent {
  protected readonly store = inject(VocabularySpellingSessionStore);

  readonly backToList = output<void>();

  displayedColumns: string[] = ['word', 'correct'];
}
