import { GeneralFilterValueType, UIDisplayString, UIDisplayStringUtil } from '../models';
import { OperatorFilterPipe } from './operator-filter.pipe';

describe('OperatorFilterPipe', () => {
  let pipe: OperatorFilterPipe;
  let arStrs: UIDisplayString[];

  beforeAll(() => {
    arStrs = UIDisplayStringUtil.getGeneralFilterOperatorDisplayStrings();
  });
  beforeEach(() => {
    pipe = new OperatorFilterPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('value type is string', () => {
    const expopers = pipe.transform(arStrs, GeneralFilterValueType.string);
    expect(expopers.length).toEqual(2);
  });

  it('value type is boolean', () => {
    const expopers = pipe.transform(arStrs, GeneralFilterValueType.boolean);
    expect(expopers.length).toEqual(1);
  });

  it('value type is number', () => {
    const expopers = pipe.transform(arStrs, GeneralFilterValueType.number);
    expect(expopers.length).toEqual(6);
  });

  it('value type is date', () => {
    const expopers = pipe.transform(arStrs, GeneralFilterValueType.date);
    expect(expopers.length).toEqual(6);
  });

  it('value type is not provided', () => {
    const expopers = pipe.transform(arStrs);
    expect(expopers.length).toEqual(arStrs.length);
  });
});
