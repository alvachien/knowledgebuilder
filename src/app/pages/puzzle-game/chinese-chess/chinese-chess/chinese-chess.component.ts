import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ChineseChessAILevel,
  ChineseChessBoardStyle,
  ChineseChessPieceStyle,
  ChineseChessPlayMode,
  UIDisplayString,
  UIDisplayStringUtil,
} from 'src/app/models';
import {
  ChineseChessPosition,
  ChineseChessResult,
  ChineseChessSearch,
  ChineseChessUtil,
  LIMIT_DEPTH,
  MAX_STEP,
  PIECE_KING,
  SQUARE_SIZE,
  STARTUP_FEN,
  WIN_VALUE,
  pieceImageName,
} from 'src/app/models/chinese-chess';

@Component({
  selector: 'khb-chinese-chess',
  templateUrl: './chinese-chess.component.html',
  styleUrls: ['./chinese-chess.component.scss'],
})
export class ChineseChessComponent implements OnInit, AfterViewInit {
  selectedMoveMode: ChineseChessPlayMode = ChineseChessPlayMode.PlayerFirst;
  selectedAILevel: ChineseChessAILevel = ChineseChessAILevel.Easy;
  selectedBoardStyle: ChineseChessBoardStyle = ChineseChessBoardStyle.Wood;
  selectedPieceStyle: ChineseChessPieceStyle = ChineseChessPieceStyle.Wood;
  audioEnabled = false;
  private result: ChineseChessResult = ChineseChessResult.Unknown;
  private pos: ChineseChessPosition | null = null;
  private objUtil: ChineseChessUtil = new ChineseChessUtil();
  private mvLast = 0;
  private imgSquares: any[] = [];
  private computer = -1;
  private animated = true;
  private search: ChineseChessSearch | null = null;
  private sqSelected = 0;
  private millis = 0;
  private busy = false;
  isStarted = false;

  @ViewChild('chesscontainer', { static: true }) elementChessContainer: ElementRef | null = null;
  arPlayModeDisplayStrings: UIDisplayString[] = [];
  arAILevelDisplayStrings: UIDisplayString[] = [];
  arBoardStyleDisplayStrings: UIDisplayString[] = [];
  arPieceStyleDisplayStrings: UIDisplayString[] = [];

  constructor(private _snackBar: MatSnackBar) {
    console.debug('Entering ChineseChessComponent.constructor');
    this.arPlayModeDisplayStrings = UIDisplayStringUtil.getChineseChessPlayModeDisplayStrings();
    this.arAILevelDisplayStrings = UIDisplayStringUtil.getChineseChessAILevelDisplayStrings();
    this.arBoardStyleDisplayStrings = UIDisplayStringUtil.getChineseChessBoardStyleDisplayStrings();
    this.arPieceStyleDisplayStrings = UIDisplayStringUtil.getChineseChessPieceStyleDisplayStrings();
  }

  ngOnInit(): void {
    console.debug('Entering ChineseChessComponent.ngOnInit');
  }

  ngAfterViewInit(): void {
    console.debug('Entering ChineseChessComponent.ngAfterViewInit');

    if (this.elementChessContainer !== null && this.imgSquares.length !== 256) {
      for (let sq = 0; sq < 256; sq++) {
        if (!this.objUtil.IN_BOARD(sq)) {
          this.imgSquares.push(null);
          continue;
        }

        const img = document.createElement('img');
        const style = img.style;
        style.position = 'absolute';
        const sx = this.objUtil.SQ_X(sq);
        const sy = this.objUtil.SQ_Y(sq);
        style.left = sx.toString() + 'px';
        style.top = sy.toString() + 'px';
        style.width = SQUARE_SIZE.toString();
        style.height = SQUARE_SIZE.toString();
        style.zIndex = '0';
        img.onmousedown = () => this.clickSquare(sq);
        this.elementChessContainer.nativeElement.appendChild(img);
        this.imgSquares.push(img);
      }
    }
  }

  onSelectedMoveModeChange(event: any) {
    console.debug('Entering ChineseChessComponent.onSelectedMoveModeChange');
    console.debug(event);
  }

  onSelectedAILevelChange(event: any) {
    console.debug('Entering ChineseChessComponent.onSelectedAILevelChange');
    console.debug(event);
  }

  onSurrend() {
    console.debug('Entering ChineseChessComponent.onSurrend');
    this.isStarted = false;
  }

  onStart() {
    console.debug(`Entering ChineseChessComponent.onStart`);
    if (!this.isStarted) {
      this.isStarted = true;

      // Set background
      this.elementChessContainer!.nativeElement.style.background = `url(assets/image/chinesechess/boards/${this.selectedBoardStyle}.gif)`;

      // Really start the game
      this.result = ChineseChessResult.Unknown;
      this.millis = 10;
      if (this.selectedMoveMode === ChineseChessPlayMode.AIFirst) {
        this.computer = 0;
      } else if (this.selectedMoveMode === ChineseChessPlayMode.PlayerFirst) {
        this.computer = 1;
      } else {
        this.computer = -1;
      }

      this.pos = new ChineseChessPosition();
      this.pos.fromFen(STARTUP_FEN[0]);
      this.setSearch(16);

      this.flushBoard();
    }
  }

  drawSquare(sq: number, selected?: boolean) {
    console.debug('Entering ChineseChessComponent.drawSquare');

    const img = this.imgSquares[this.flipped(sq)];
    img.src =
      `assets/image/chinesechess/pieces/${this.selectedPieceStyle}/` + pieceImageName[this.pos!.squares[sq]] + '.gif';
    img.style.backgroundImage = selected ? 'url(assets/image/chinesechess/oos.gif)' : '';
  }

  flushBoard() {
    console.debug('Entering ChineseChessComponent.flushBoard');

    this.mvLast = this.pos!.mvList[this.pos!.mvList.length - 1];
    for (let sq = 0; sq < 256; sq++) {
      if (this.objUtil.IN_BOARD(sq)) {
        this.drawSquare(sq, sq === this.objUtil.SRC(this.mvLast) || sq === this.objUtil.DST(this.mvLast));
      }
    }
  }

  clickSquare(sq_: number) {
    console.debug('Entering ChineseChessComponent.clickSquare');

    if (this.busy || this.result !== ChineseChessResult.Unknown) {
      return;
    }
    const sq = this.flipped(sq_);
    const pc = this.pos!.squares[sq];
    if ((pc & this.objUtil.SIDE_TAG(this.pos!.sdPlayer)) !== 0) {
      //   this.playSound("click");
      if (this.mvLast != 0) {
        this.drawSquare(this.objUtil.SRC(this.mvLast), false);
        this.drawSquare(this.objUtil.DST(this.mvLast), false);
      }
      if (this.sqSelected) {
        this.drawSquare(this.sqSelected, false);
      }
      this.drawSquare(sq, true);
      this.sqSelected = sq;
    } else if (this.sqSelected > 0) {
      this.addMove(this.objUtil.MOVE(this.sqSelected, sq), false);
    }
  }
  flipped(sq: number) {
    return this.computer === 0 ? this.objUtil.SQUARE_FLIP(sq) : sq;
  }
  setSearch(hashLevel: number) {
    this.search = hashLevel === 0 ? null : new ChineseChessSearch(this.pos!, hashLevel);
  }
  computerMove(): boolean {
    return this.pos!.sdPlayer === this.computer;
  }

  response() {
    console.debug('Entering response()');
    if (this.search === null || !this.computerMove()) {
      this.busy = false;
      return;
    }

    //   this.thinking.style.visibility = "visible";
    //   var this_ = this;
    this.busy = true;
    setTimeout(() => {
      this.addMove(this.search!.searchMain(LIMIT_DEPTH, this.millis), true);
      // this.thinking.style.visibility = "hidden";
    }, 250);
  }

  addMove(mv: number, computerMove: boolean) {
    console.debug('Entering ChineseChessComponent.addMove()');
    if (!this.pos!.legalMove(mv)) {
      return;
    }
    if (!this.pos!.makeMove(mv)) {
      // this.playSound("illegal");
      return;
    }

    this.busy = true;
    if (!this.animated) {
      this.postAddMove(mv, computerMove);
      return;
    }

    const sqSrc = this.flipped(this.objUtil.SRC(mv));
    const xSrc = this.objUtil.SQ_X(sqSrc);
    const ySrc = this.objUtil.SQ_Y(sqSrc);
    const sqDst = this.flipped(this.objUtil.DST(mv));
    const xDst = this.objUtil.SQ_X(sqDst);
    const yDst = this.objUtil.SQ_Y(sqDst);
    const style = this.imgSquares[sqSrc].style;
    style.zIndex = 256;
    let step = MAX_STEP - 1;

    const timer = setInterval(() => {
      if (step === 0) {
        clearInterval(timer);
        style.left = xSrc + 'px';
        style.top = ySrc + 'px';
        style.zIndex = 0;
        this.postAddMove(mv, computerMove);
      } else {
        style.left = this.objUtil.MOVE_PX(xSrc, xDst, step);
        style.top = this.objUtil.MOVE_PX(ySrc, yDst, step);
        step--;
      }
    }, 16);
    //   var this_ = this;
    //   var timer = setInterval(function() {
    // 	if (step == 0) {
    // 	  clearInterval(timer);
    // 	  style.left = xSrc + "px";
    // 	  style.top = ySrc + "px";
    // 	  style.zIndex = 0;
    // 	  this_.postAddMove(mv, computerMove);
    // 	} else {
    // 	  style.left = this.objUtil.MOVE_PX(xSrc, xDst, step);
    // 	  style.top = this.objUtil.MOVE_PX(ySrc, yDst, step);
    // 	  step --;
    // 	}
    //   }, 16);
  }

  postAddMove(mv: number, computerMove: boolean) {
    console.debug('Entering ChineseChessComponent.postAddMove');

    if (this.mvLast > 0) {
      this.drawSquare(this.objUtil.SRC(this.mvLast), false);
      this.drawSquare(this.objUtil.DST(this.mvLast), false);
    }
    this.drawSquare(this.objUtil.SRC(mv), true);
    this.drawSquare(this.objUtil.DST(mv), true);
    this.sqSelected = 0;
    this.mvLast = mv;

    if (this.pos!.isMate()) {
      // this.playSound(computerMove ? "loss" : "win");
      this.result = computerMove ? ChineseChessResult.Loss : ChineseChessResult.Win;

      const pc = this.objUtil.SIDE_TAG(this.pos!.sdPlayer) + PIECE_KING;
      let sqMate = 0;
      for (let sq = 0; sq < 256; sq++) {
        if (this.pos!.squares[sq] === pc) {
          sqMate = sq;
          break;
        }
      }
      if (!this.animated || sqMate == 0) {
        this.postMate(computerMove);
        return;
      }

      sqMate = this.flipped(sqMate);
      const style = this.imgSquares[sqMate].style;
      style.zIndex = 256;
      const xMate = this.objUtil.SQ_X(sqMate);
      let step = MAX_STEP;

      const timer = setInterval(() => {
        if (step === 0) {
          clearInterval(timer);
          style.left = xMate + 'px';
          style.zIndex = 0;
          this.imgSquares[sqMate].src =
            `assets/image/chinesechess/${this.selectedPieceStyle}/` + (this.pos!.sdPlayer == 0 ? 'r' : 'b') + 'km.gif';
          this.postMate(computerMove);
        } else {
          style.left = xMate + ((step & 1) === 0 ? step : -step) * 2 + 'px';
          step--;
        }
      }, 50);
      return;
    }

    let vlRep = this.pos!.repStatus(3);
    if (vlRep > 0) {
      vlRep = this.pos!.repValue(vlRep);
      if (Math.abs(vlRep) < WIN_VALUE) {
        console.debug(`postAddMove, vlRep = ${vlRep}`);
        // this.playSound("draw");
        this.result = ChineseChessResult.Draw; //  RESULT_DRAW;
        this._snackBar.open('双方不变作和，辛苦了！');
      } else if (computerMove === vlRep < 0) {
        // this.playSound("loss");
        this.result = ChineseChessResult.Loss; //  RESULT_LOSS;
        this._snackBar.open('长打作负，请不要气馁！');
      } else {
        // this.playSound("win");
        this.result = ChineseChessResult.Win; //  RESULT_WIN;
        this._snackBar.open('长打作负，祝贺你取得胜利！');
      }

      this.postAddMove2();
      this.busy = false;
      return;
    }

    if (this.pos!.captured()) {
      let hasMaterial = false;
      for (let sq = 0; sq < 256; sq++) {
        if (this.objUtil.IN_BOARD(sq) && (this.pos!.squares[sq] & 7) > 2) {
          hasMaterial = true;
          break;
        }
      }
      if (!hasMaterial) {
        // this.playSound("draw");
        this.result = ChineseChessResult.Draw; // RESULT_DRAW;
        this._snackBar.open('双方都没有进攻棋子了，辛苦了！');

        this.postAddMove2();
        this.busy = false;
        return;
      }
    } else if (this.pos!.pcList.length > 100) {
      let captured = false;
      for (let i = 2; i <= 100; i++) {
        if (this.pos!.pcList[this.pos!.pcList.length - i] > 0) {
          captured = true;
          break;
        }
      }
      if (!captured) {
        // this.playSound("draw");
        this.result = ChineseChessResult.Draw; //  RESULT_DRAW;
        this._snackBar.open('超过自然限着作和，辛苦了！');

        this.postAddMove2();
        this.busy = false;
        return;
      }
    }

    if (this.pos!.inCheck()) {
      // this.playSound(computerMove ? "check2" : "check");
    } else if (this.pos!.captured()) {
      // this.playSound(computerMove ? "capture2" : "capture");
    } else {
      // this.playSound(computerMove ? "move2" : "move");
    }

    this.postAddMove2();
    this.response();
  }

  postAddMove2() {
    // if (typeof this.onAddMove == "function") {
    //   this.onAddMove();
    // }
  }

  postMate(computerMove: boolean) {
    console.debug('Entering ChineseChessComponent.postMate');
    // alertDelay(computerMove ? "请再接再厉！" : "祝贺你取得胜利！");
    if (computerMove) {
      // Computer win
      this.result = ChineseChessResult.Loss;
      alert('请再接再厉！');
      this.isStarted = false;
    } else {
      // Player win
      this.result = ChineseChessResult.Win;
      alert('祝贺你取得胜利！');
      this.isStarted = false;
    }

    this.postAddMove2();
    this.busy = false;
  }
}
