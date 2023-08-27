import { ChineseChessUtil } from './chinese-chess';

describe('ChineseChessUtil', () => {
  let testObj: ChineseChessUtil;

  beforeEach(() => {
    testObj = new ChineseChessUtil();
  });

  it('shall be created', () => {
    expect(testObj).toBeTruthy();
  });

  it('SQ_X', () => {
    for (let i = 0; i < 256; i++) {
      if (testObj.IN_BOARD(i)) {
        const rst = testObj.SQ_X(i);
        expect(rst).toBeTruthy();
      }
    }
  });
});
