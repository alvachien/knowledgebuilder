import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';

import { TranslateTypingSessionStore } from './translate-exercises-typing-session.store';

/**
 * Typing (translation) session screen: the prompt of the current sentence, a
 * free input for the translation, and submit controls. The input owns its
 * keystrokes — no global key handler. All state lives in the shared session
 * store; `quit` returns to the list.
 */
@Component({
  selector: 'app-translate-exercises-typing-session',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatTooltipModule,
    TranslocoModule,
  ],
  templateUrl: './translate-exercises-typing-session.component.html',
  styleUrl: './translate-exercises-typing-session.component.scss',
})
export class TranslateExercisesTypingSessionComponent {
  protected readonly store = inject(TranslateTypingSessionStore);

  readonly quit = output<void>();
}
