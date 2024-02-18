import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

export interface typingCompare {
  expected: string;
  inputted: string;
}

@Component({
  selector: 'khb-typing-game',
  templateUrl: './typing-game.component.html',
  styleUrls: ['./typing-game.component.scss'],
})
export class TypingGameComponent implements OnInit, AfterViewInit {
  // @ViewChild('type-game-canvas', { static: true }) canvasTypeGame!: ElementRef;

  constructor() {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

}
