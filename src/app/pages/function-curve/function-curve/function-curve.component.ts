import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { KatexOptions } from 'ngx-markdown';

import { FunctionCurve } from 'src/app/models';

@Component({
  selector: 'khb-function-curve',
  templateUrl: './function-curve.component.html',
  styleUrls: ['./function-curve.component.scss'],
})
export class FunctionCurveComponent implements AfterViewInit {
  @ViewChild('func_curve', { static: true }) content!: ElementRef;
  supportedFunc: FunctionCurve[] = FunctionCurve.getAllCurves();
  selectedFuncVal?: number;
  selectedFuncFormat?: string;

  public mathOptions: KatexOptions = {
    displayMode: true,
    throwOnError: false,
    errorColor: '#cc0000',
  };

  ngAfterViewInit(): void {}

  onFuncSelectionChanged(): void {
    if (this.content) {
      const ctx2 = this.content.nativeElement.getContext('2d');
      const xTotal = this.content.nativeElement.width;
      const yTotal = this.content.nativeElement.height;
      ctx2.clearRect(0, 0, xTotal, yTotal);
      ctx2.save();
      ctx2.beginPath();

      if (this.selectedFuncVal) {
        const funcCurve = this.supportedFunc.find((fc) => fc.value === this.selectedFuncVal);
        if (funcCurve) {
          this.selectedFuncFormat = funcCurve.latexDisp;

          const xDispUnits = funcCurve.dispXMax! - funcCurve.dispXMin!;
          const yDispUnits = funcCurve.dispYMax! - funcCurve.dispYMin!;

          const xDispUnitLen = xTotal / xDispUnits;
          const yDispUnitLen = yTotal / yDispUnits;
          const uiDispUnitLen = Math.min(xDispUnitLen, yDispUnitLen);

          ctx2.strokeStyle = '#000';

          ctx2.translate(xTotal / 2, yTotal / 2);

          // X - axis.
          ctx2.moveTo((-1 * xTotal) / 2, 0);
          ctx2.lineTo(xTotal / 2, 0);
          ctx2.stroke();
          for (let iX = funcCurve.dispXMin!; iX < funcCurve.dispXMax!; iX++) {
            ctx2.moveTo(iX * uiDispUnitLen, (-1 * uiDispUnitLen!) / 2);
            ctx2.lineTo(iX * uiDispUnitLen, uiDispUnitLen / 2);
            ctx2.stroke();
          }

          // Y - axis.
          ctx2.moveTo(0, (-1 * yTotal) / 2);
          ctx2.lineTo(0, yTotal / 2);
          ctx2.stroke();
          for (let iY = funcCurve.dispYMin!; iY < funcCurve.dispYMax!; iY++) {
            ctx2.moveTo((-1 * uiDispUnitLen!) / 2, -1 * iY * uiDispUnitLen);
            ctx2.lineTo(uiDispUnitLen! / 2, -1 * iY * uiDispUnitLen);
            ctx2.stroke();
          }

          // Points.
          const arPoints = funcCurve.getCurveData();
          if (arPoints.length > 0) {
            arPoints.sort((a, b) => a.x - b.x);
            ctx2.moveTo(arPoints[0].x * uiDispUnitLen, -1 * arPoints[0].y * uiDispUnitLen);
            for (let iPoint = 1; iPoint < arPoints.length; iPoint++) {
              ctx2.lineTo(arPoints[iPoint].x * uiDispUnitLen, -1 * arPoints[iPoint].y * uiDispUnitLen);
              ctx2.stroke();

              ctx2.moveTo(arPoints[iPoint].x * uiDispUnitLen, -1 * arPoints[iPoint].y * uiDispUnitLen);
            }
          }
        }

        ctx2.restore();
      }
    }
  }
}
