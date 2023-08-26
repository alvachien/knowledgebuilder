
export interface CurvePoint {
    x: number;
    y: number;
}

export const Curve_y_x = 1;

export class FunctionCurve {
    value?: number;
    disp?: string;
    dispXMin?: number;
    dispXMax?: number;
    dispYMin?: number;
    dispYMax?: number;
    dispXUnit?: number;
    calcXUnit?: number;    

    static getAllCurves(): FunctionCurve[] {
        let curves: FunctionCurve[] = [];

        let cuv: FunctionCurve = new FunctionCurve();
        cuv.value = Curve_y_x;
        cuv.disp = 'y = x';
        cuv.dispXMin = -10;
        cuv.dispXMax = 10;
        cuv.dispYMin = -10;
        cuv.dispYMax = 10;
        cuv.dispXUnit = 1;
        cuv.calcXUnit = 0.1;
        curves.push(cuv);

        return curves;
    }

    getCurveData(): CurvePoint[] {
        let points: CurvePoint[] = [];
        if (this.value === Curve_y_x) {
            let xstart = this.dispXMin!;
            for(; xstart < this.dispXMax!; xstart += this.calcXUnit! ) {
                points.push({x: xstart, y: xstart});
            }
        }

        return points;
    }
}
