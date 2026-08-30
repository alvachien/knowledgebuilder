import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { TranslocoModule } from '@jsverse/transloco';

import { TranslateTypingSessionStore } from './translate-exercises-typing-session.store';

/**
 * Typing-result screen of the sentence page: the time cost, the score line and
 * the per-sentence results (input vs. expected) with real correctness, all
 * read from the shared session store.
 */
@Component({
  selector: 'app-translate-exercises-typing-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatTableModule,
    TranslocoModule,
  ],
  templateUrl: './translate-exercises-typing-result.component.html',
  styleUrl: './translate-exercises-typing-result.component.scss',
})
export class TranslateExercisesTypingResultComponent {
  protected readonly store = inject(TranslateTypingSessionStore);

  readonly backToList = output<void>();

  displayedColumns: string[] = ['ensent', 'enwords', 'cnsent', 'inputted', 'correct'];
}
