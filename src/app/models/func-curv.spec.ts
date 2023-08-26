import { Curve_y_x, FunctionCurve } from "./func-curve";

describe('FunctionCurve', () => {
    let testObj: FunctionCurve;

    beforeEach(() => {
        testObj = new FunctionCurve();
    });

    it('shall be created', () => {
        expect(testObj).toBeTruthy();
    });

    it('Test attributes', () => {
        testObj.value = 1;
        testObj.disp = 'test';
        expect(testObj.value).toEqual(1);
        expect(testObj.disp).toEqual('test');
    });

    it('Default curves', () => {
        let curves = FunctionCurve.getAllCurves();

        expect(curves.length).toBeGreaterThan(0);

        curves.forEach(cuve => {
            if (cuve.value === Curve_y_x) {
                let points = cuve.getCurveData();
                expect(points.length).toBeGreaterThan(0);    
            }
        })
    });
});
