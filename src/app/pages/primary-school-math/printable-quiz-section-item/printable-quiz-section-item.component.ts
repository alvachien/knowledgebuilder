import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-printable-quiz-section-item',
  templateUrl: './printable-quiz-section-item.component.html',
  styleUrls: ['./printable-quiz-section-item.component.scss'],
})
export class PrintableQuizSectionItemComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() quizSection: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() arPlaceHolder: any[] = [];
}
