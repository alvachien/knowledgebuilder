import { NumberUtility } from 'actslib';

export interface CurvePoint {
  x: number;
  y: number;
}

export const Curve_y_x = 1;
export const Curve_y_x_pow_2 = 2;
export const Curve_y_1_div_x = 3;
export const Curve_y_2_pow_x = 4;
export const Curve_y_x_sqrt_2 = 5;
export const Curve_y_log2_x = 6;
export const Curve_y_lg_x = 7;
export const Curve_y_ln_x = 8;

export interface CurveExcludedValue {
  minValue: number;
  maxValue: number;
}

export class FunctionCurve {
  value?: number;
  disp?: string;
  latexDisp?: string;
  dispXMin?: number;
  dispXMax?: number;
  dispYMin?: number;
  dispYMax?: number;
  dispXUnit?: number;
  calcXUnit?: number;
  excludedXValues: CurveExcludedValue[] = [];

  static getAllCurves(): FunctionCurve[] {
    const curves: FunctionCurve[] = [];

    let cuv: FunctionCurve = new FunctionCurve();
    cuv.value = Curve_y_x;
    cuv.disp = 'y = x';
    cuv.latexDisp = `$ y =x $`;
    cuv.dispXMin = -10;
    cuv.dispXMax = 10;
    cuv.dispYMin = -10;
    cuv.dispYMax = 10;
    cuv.dispXUnit = 1;
    cuv.calcXUnit = 0.1;
    curves.push(cuv);

    cuv = new FunctionCurve();
    cuv.value = Curve_y_x_pow_2;
    cuv.disp = 'y = x^2';
    cuv.latexDisp = `$ y =x^2 $`;
    cuv.dispXMin = -3;
    cuv.dispXMax = 3;
    cuv.dispYMin = -10;
    cuv.dispYMax = 10;
    cuv.dispXUnit = 1;
    cuv.calcXUnit = 0.1;
    curves.push(cuv);

    cuv = new FunctionCurve();
    cuv.value = Curve_y_1_div_x;
    cuv.disp = 'y = 1/x';
    cuv.latexDisp = '$ y = \\frac{1}{x} $';
    cuv.dispXMin = -10;
    cuv.dispXMax = 10;
    cuv.dispYMin = -10;
    cuv.dispYMax = 10;
    cuv.dispXUnit = 1;
    cuv.calcXUnit = 0.1;
    cuv.excludedXValues.push({ minValue: -0.015, maxValue: 0.015 } as CurveExcludedValue);
    curves.push(cuv);

    cuv = new FunctionCurve();
    cuv.value = Curve_y_2_pow_x;
    cuv.disp = 'y = 2 ^ x';
    cuv.latexDisp = `$ y = 2^x $`;
    cuv.dispXMin = -3.2;
    cuv.dispXMax = 3.2;
    cuv.dispYMin = -10;
    cuv.dispYMax = 10;
    cuv.dispXUnit = 1;
    cuv.calcXUnit = 0.1;
    curves.push(cuv);

    cuv = new FunctionCurve();
    cuv.value = Curve_y_x_sqrt_2;
    cuv.disp = 'y = sqrt(x)';
    cuv.latexDisp = '$ y = \\sqrt{x} $';
    cuv.dispXMin = 0;
    cuv.dispXMax = 10;
    cuv.dispYMin = 0;
    cuv.dispYMax = 10;
    cuv.dispXUnit = 1;
    cuv.calcXUnit = 0.1;
    curves.push(cuv);

    cuv = new FunctionCurve();
    cuv.value = Curve_y_log2_x;
    cuv.disp = 'y = log2(x)';
    cuv.latexDisp = '$ y = \\log_2{x} $';
    cuv.dispXMin = 0.2;
    cuv.dispXMax = 10;
    cuv.dispYMin = -10;
    cuv.dispYMax = 10;
    cuv.dispXUnit = 1;
    cuv.calcXUnit = 0.1;
    curves.push(cuv);

    cuv = new FunctionCurve();
    cuv.value = Curve_y_ln_x;
    cuv.disp = 'y = ln(x)';
    cuv.latexDisp = '$ y = \\ln{x} $';
    cuv.dispXMin = 0.2;
    cuv.dispXMax = 10;
    cuv.dispYMin = -10;
    cuv.dispYMax = 10;
    cuv.dispXUnit = 1;
    cuv.calcXUnit = 0.1;
    curves.push(cuv);

    cuv = new FunctionCurve();
    cuv.value = Curve_y_lg_x;
    cuv.disp = 'y = lg(x)';
    cuv.latexDisp = '$ y = \\lg{x} $';
    cuv.dispXMin = 0.2;
    cuv.dispXMax = 10;
    cuv.dispYMin = -10;
    cuv.dispYMax = 10;
    cuv.dispXUnit = 1;
    cuv.calcXUnit = 0.1;
    curves.push(cuv);

    return curves;
  }

  getCurveData(): CurvePoint[] {
    const points: CurvePoint[] = [];
    if (this.value === Curve_y_x) {
      let xstart = this.dispXMin!;
      for (; xstart < this.dispXMax!; xstart += this.calcXUnit!) {
        points.push({ x: NumberUtility.Round2Any(xstart, 4), y: NumberUtility.Round2Any(xstart, 4) });
      }
    } else if (this.value === Curve_y_x_pow_2) {
      let xstart = this.dispXMin!;
      for (; xstart < this.dispXMax!; xstart += this.calcXUnit!) {
        points.push({ x: NumberUtility.Round2Any(xstart, 4), y: NumberUtility.Round2Any(xstart * xstart, 4) });
      }
    } else if (this.value === Curve_y_1_div_x) {
      let xstart = this.dispXMin!;
      for (; xstart < this.dispXMax!; xstart += this.calcXUnit!) {
        const bexcluded = this.excludedXValues.findIndex((ev) => ev.maxValue > xstart && ev.minValue < xstart) !== -1;
        if (!bexcluded) {
          points.push({ x: NumberUtility.Round2Any(xstart, 4), y: NumberUtility.Round2Any(1 / xstart, 4) });
        }
      }
    } else if (this.value === Curve_y_2_pow_x) {
      let xstart = this.dispXMin!;
      for (; xstart < this.dispXMax!; xstart += this.calcXUnit!) {
        const bexcluded = this.excludedXValues.findIndex((ev) => ev.maxValue > xstart && ev.minValue < xstart) !== -1;
        if (!bexcluded) {
          points.push({ x: NumberUtility.Round2Any(xstart, 4), y: NumberUtility.Round2Any(Math.pow(2, xstart), 4) });
        }
      }
    } else if (this.value === Curve_y_x_sqrt_2) {
      let xstart = this.dispXMin!;
      for (; xstart < this.dispXMax!; xstart += this.calcXUnit!) {
        const bexcluded = this.excludedXValues.findIndex((ev) => ev.maxValue > xstart && ev.minValue < xstart) !== -1;
        if (!bexcluded) {
          points.push({ x: NumberUtility.Round2Any(xstart, 4), y: NumberUtility.Round2Any(Math.sqrt(xstart), 4) });
        }
      }
    } else if (this.value === Curve_y_log2_x) {
      let xstart = this.dispXMin!;
      for (; xstart < this.dispXMax!; xstart += this.calcXUnit!) {
        const bexcluded = this.excludedXValues.findIndex((ev) => ev.maxValue > xstart && ev.minValue < xstart) !== -1;
        if (!bexcluded) {
          points.push({ x: NumberUtility.Round2Any(xstart, 4), y: NumberUtility.Round2Any(Math.log2(xstart), 4) });
        }
      }
    } else if (this.value === Curve_y_lg_x) {
      let xstart = this.dispXMin!;
      for (; xstart < this.dispXMax!; xstart += this.calcXUnit!) {
        const bexcluded = this.excludedXValues.findIndex((ev) => ev.maxValue > xstart && ev.minValue < xstart) !== -1;
        if (!bexcluded) {
          points.push({ x: NumberUtility.Round2Any(xstart, 4), y: NumberUtility.Round2Any(Math.log10(xstart), 4) });
        }
      }
    } else if (this.value === Curve_y_ln_x) {
      let xstart = this.dispXMin!;
      for (; xstart < this.dispXMax!; xstart += this.calcXUnit!) {
        const bexcluded = this.excludedXValues.findIndex((ev) => ev.maxValue > xstart && ev.minValue < xstart) !== -1;
        if (!bexcluded) {
          points.push({ x: NumberUtility.Round2Any(xstart, 4), y: NumberUtility.Round2Any(Math.log(xstart), 4) });
        }
      }
    }

    return points;
  }
}
