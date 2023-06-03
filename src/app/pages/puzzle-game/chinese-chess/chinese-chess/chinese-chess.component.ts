import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ChineseChessBoard, STARTUP_FEN } from 'src/app/models/chinese-chess';

@Component({
  selector: 'app-chinese-chess',
  templateUrl: './chinese-chess.component.html',
  styleUrls: ['./chinese-chess.component.scss'],
})
export class ChineseChessComponent implements OnInit, AfterViewInit {
  selectedMoveMode = '0';
  selectedAILevel = '0';
  audioEnabled = false;
  insBoard: ChineseChessBoard | null = null;
  @ViewChild('chesscontainer', { static: true }) elementChessContainer: ElementRef | null = null;

  constructor() {
    // Emtpy for now
  }

  ngOnInit(): void {
    console.debug('Entering ChineseChessComponent.ngOnInit');
    // TBD.
  }

  ngAfterViewInit(): void {
    console.debug('Entering ChineseChessComponent.ngAfterViewInit');

    if (this.elementChessContainer !== null) {
      this.elementChessContainer.nativeElement.style.background = 'url(assets/image/chinesechess/board.jpg)';
    }

    this.insBoard = new ChineseChessBoard(this.elementChessContainer?.nativeElement);
  }

  onSelectedMoveModeChange(event: any) {
    console.debug('Entering onSelectedMoveModeChange');
    console.debug(event);
  }

  onSelectedAILevelChange(event: any) {
    console.debug('Entering onSelectedAILevelChange');
    console.debug(event);
  }

  onStart() {
    console.debug('Entering onStart');
    this.insBoard?.start(STARTUP_FEN[0]);
  }
}
