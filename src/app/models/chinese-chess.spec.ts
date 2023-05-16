import { ChineseChessUtil } from "./chinese-chess";

describe('ChineseChessUtil', () => {
    let testObj: ChineseChessUtil;

    beforeEach(() => {
        testObj = new ChineseChessUtil();
    });

    it('getCoordinate', () => {
        let coord = testObj.getCoordiate(2, 3);
        expect(coord).toBeTruthy();

        let rn = testObj.getRowFromCoordinate(coord);
        expect(rn).toEqual(2);
        let cn = testObj.getColumnFromCoordinate(coord);
        expect(rn).toEqual(3);
    });
});
