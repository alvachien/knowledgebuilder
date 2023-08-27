import { AfterContentInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';

import { Gobang } from 'src/app/models';
import { CanvasCellPositionInf, getCanvasCellPosition, getCanvasMouseEventPosition } from 'actslib';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ResultDialogComponent } from '../result-dialog/result-dialog.component';

@Component({
  selector: 'khb-gobang-game',
  templateUrl: './gobang-game.component.html',
  styleUrls: ['./gobang-game.component.scss'],
})
export class GobangGameComponent implements AfterContentInit {
  private _cellsize = 15;
  private _cellheight: number;
  private _cellwidth: number;
  private _userStep: boolean; // True for first player, false for second player
  private _instance: Gobang;

  // Canvas
  @ViewChild('canvasgobang', { static: true }) canvasGobang!: ElementRef;

  @HostListener('mousedown', ['$event'])
  public onGobangCanvasMouseDown(evt: MouseEvent) {
    const loc = getCanvasMouseEventPosition(evt.target, evt);
    const cellloc = getCanvasCellPosition(loc, this._cellwidth, this._cellheight);

    // Process step
    this.onProcessStep(cellloc);
  }

  constructor(public dialog: MatDialog) {
    // Hard coded width and height
    this._cellheight = 40;
    this._cellwidth = 40;

    this._userStep = true;
    this._instance = new Gobang();
  }

  ngAfterContentInit(): void {
    this._instance.Dimension = this._cellsize;
    this._instance.init();

    // Resize the canvas size
    this.canvasGobang.nativeElement.width = this._cellwidth * this._cellsize;
    this.canvasGobang.nativeElement.height = this._cellheight * this._cellsize;

    // Draw the border
    this.drawWholeRect();
  }

  private drawWholeRect() {
    const ctx2 = this.canvasGobang.nativeElement.getContext('2d');
    ctx2.clearRect(0, 0, this.canvasGobang.nativeElement.width, this.canvasGobang.nativeElement.height);
    ctx2.save();
    ctx2.fillStyle = 'rgba(0, 0, 100, 0.2)';
    ctx2.fillRect(0, 0, this.canvasGobang.nativeElement.width, this.canvasGobang.nativeElement.height);
    ctx2.restore();

    for (let i = 0; i <= this._cellsize; i++) {
      ctx2.beginPath();
      ctx2.moveTo(0, i * this._cellheight);
      ctx2.lineTo(this._cellheight * this._cellsize, i * this._cellheight);
      ctx2.closePath();
      ctx2.stroke();

      ctx2.beginPath();
      ctx2.moveTo(i * this._cellwidth, 0);
      ctx2.lineTo(i * this._cellheight, this._cellwidth * this._cellsize);
      ctx2.closePath();
      ctx2.stroke();
    }
  }

  private drawChess(cellloc: CanvasCellPositionInf) {
    const ctx2 = this.canvasGobang.nativeElement.getContext('2d');

    const image = new Image();
    if (this._userStep) {
      image.src = environment.basehref + 'assets/image/gobangresource/blackchess.png';
    } else {
      image.src = environment.basehref + 'assets/image/gobangresource/whitechess.png';
    }

    image.onload = () => {
      ctx2.drawImage(
        image,
        cellloc.column * this._cellwidth,
        cellloc.row * this._cellheight,
        this._cellwidth,
        this._cellheight
      );
    };
  }

  private onProcessStep(cellloc: CanvasCellPositionInf) {
    if (this._instance.Finished) {
      return;
    }

    if (!this._instance.isCellHasValue(cellloc.row, cellloc.column)) {
      this.drawChess(cellloc);

      this._instance.setCellValue(cellloc.row, cellloc.column, this._userStep);

      if (this._instance.Finished) {
        let retry = false;
        const isWin = this._userStep ? true : false;

        const dialogRef = this.dialog.open(ResultDialogComponent, {
          width: '300px',
          data: { youWin: isWin },
        });

        dialogRef.afterClosed().subscribe((result) => {
          console.log(result);
          retry = result;
          if (retry) {
            this._userStep = true;
            this._instance = new Gobang();
            this._instance.Dimension = this._cellsize;
            this._instance.init();

            // Resize the canvas size
            this.canvasGobang.nativeElement.width = this._cellwidth * this._cellsize;
            this.canvasGobang.nativeElement.height = this._cellheight * this._cellsize;

            // Draw the border
            this.drawWholeRect();
          } else {
            this._userStep = false;
          }
        });
      } else {
        this._userStep = !this._userStep;
        if (this._userStep === false) {
          // AI step - set 0.5secons interval here.
          setTimeout(() => {
            const nextPos = this._instance.workoutNextCellAIPosition();
            this.onProcessStep(nextPos);
          }, 500);
        }
      }
    }
  }
}
