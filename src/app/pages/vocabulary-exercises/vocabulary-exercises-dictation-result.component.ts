import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@jsverse/transloco';

import { VocabularyDictationSessionStore } from './vocabulary-exercises-dictation-session.store';

/**
 * Dictation-result screen of the vocabulary exercises page: the dictated word
 * list (order / EN word / CN explanation) read from the shared session store,
 * for the user to check what was played. No score/correctness column - there
 * is no typing in dictation.
 */
@Component({
  selector: 'app-vocabulary-exercises-dictation-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatTableModule,
    TranslocoModule,
  ],
  templateUrl: './vocabulary-exercises-dictation-result.component.html',
  styleUrl: './vocabulary-exercises-dictation-result.component.scss',
})
export class VocabularyExercisesDictationResultComponent {
  protected readonly store = inject(VocabularyDictationSessionStore);

  readonly backToList = output<void>();

  displayedColumns: string[] = ['order', 'enword', 'cnword'];
}
