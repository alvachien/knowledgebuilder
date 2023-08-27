import { Gobang } from './gobang';

describe('Gobang', () => {
  let objtbt: Gobang;

  beforeEach(() => {
    objtbt = new Gobang();
  });

  it('basic', () => {
    expect(objtbt).toBeTruthy();

    objtbt.init();

    expect(objtbt.Dimension).toBeTruthy();
    expect(objtbt.Finished).toBeFalsy();
  });

  it('test', () => {
    objtbt.init();
    objtbt.setCellValue(3, 3, true);

    if (!objtbt.Finished) {
      const pos = objtbt.workoutNextCellAIPosition();
      objtbt.setCellValue(pos.row, pos.column, false);
    }
    expect(objtbt.Finished).toBeFalse();

    if (!objtbt.isCellHasValue(3, 4)) {
      objtbt.setCellValue(3, 4, true);
      if (!objtbt.Finished) {
        const pos = objtbt.workoutNextCellAIPosition();
        objtbt.setCellValue(pos.row, pos.column, false);
      }
    } else {
      objtbt.setCellValue(3, 5, true);
      if (!objtbt.Finished) {
        const pos = objtbt.workoutNextCellAIPosition();
        objtbt.setCellValue(pos.row, pos.column, false);
      }
    }
    expect(objtbt.Finished).toBeFalse();
  });
});
