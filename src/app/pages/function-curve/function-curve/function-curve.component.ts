import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FunctionCurve } from 'src/app/models';

@Component({
  selector: 'khb-function-curve',
  templateUrl: './function-curve.component.html',
  styleUrls: ['./function-curve.component.scss'],
})
export class FunctionCurveComponent implements AfterViewInit {
  @ViewChild('func_curve', { static: false }) content!: ElementRef;
  supportedFunc: FunctionCurve[] = FunctionCurve.getAllCurves();
  selectedFunc?: number;

  ngAfterViewInit(): void {
  }

  onFuncSelectionChanged(): void {
    if (this.content) {
      const ctx2 = this.content.nativeElement.getContext('2d');
      let xTotal = this.content.nativeElement.width;
      let yTotal = this.content.nativeElement.height;
      ctx2.clearRect(0, 0, xTotal, yTotal);
      ctx2.save();

      if (this.selectedFunc) {
        let funcCurve = this.supportedFunc.find(fc => fc.value === this.selectedFunc);
        if (funcCurve) {
          let xDispUnits = funcCurve.dispXMax! - funcCurve.dispXMin!;
          let yDispUnits = funcCurve.dispYMax! - funcCurve.dispYMin!;

          let xDispUnitLen = xTotal / xDispUnits;
          let yDispUnitLen = yTotal / yDispUnits;
          let uiDispUnitLen = Math.min(xDispUnitLen, yDispUnitLen);

          ctx2.strokeStyle = "#000";

          ctx2.translate(xTotal / 2, yTotal / 2);

          // X - axis. 
          ctx2.moveTo(-1 * xTotal / 2, 0); 
          ctx2.lineTo(xTotal / 2, 0);
          ctx2.stroke();
          // Y - axis.
          ctx2.moveTo(0, -1 * yTotal / 2); 
          ctx2.lineTo(0, yTotal / 2);
          ctx2.stroke();

          // Points.

        }
      }
    }
  }
}
