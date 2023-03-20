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
});
