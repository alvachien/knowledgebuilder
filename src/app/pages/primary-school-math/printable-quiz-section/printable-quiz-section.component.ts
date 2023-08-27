import { Component, Input } from '@angular/core';

@Component({
  selector: 'khb-printable-quiz-section',
  templateUrl: './printable-quiz-section.component.html',
  styleUrls: ['./printable-quiz-section.component.scss'],
})
export class PrintableQuizSectionComponent {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() arQuiz: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() arPlaceHolder: any[] = [];
}
