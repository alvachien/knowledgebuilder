//
// Unit test for tag.ts
//

import { Tag, TagCount, TagReferenceType, getTagReferenceTypeName, TagCountByRefType } from './tag';

describe('getTagReferenceTypeName', () => {
  it('shall work', () => {
    let str = getTagReferenceTypeName(TagReferenceType.ExerciseItem);
    expect(str).toBeTruthy();

    str = getTagReferenceTypeName(TagReferenceType.KnowledgeItem);
    expect(str).toBeTruthy();
  });
});

describe('Tag', () => {
  let objtc: Tag;

  beforeEach(() => {
    objtc = new Tag();
  });

  it('default value', () => {
    expect(objtc.RefType).toBeFalsy();
    expect(objtc.TagTerm).toBeFalsy();
  });

  it('parse data', () => {
    objtc.parseData({
      TagTerm: 'aaa',
      RefID: 10,
      RefType: 'ExerciseItem',
    });
    expect(objtc.TagTerm).toEqual('aaa');
    expect(objtc.RefID).toEqual(10);
  });
});

describe('TagCount', () => {
  let objtc: TagCount;

  beforeEach(() => {
    objtc = new TagCount();
  });

  it('default value', () => {
    expect(objtc.Count).toBeFalsy();
    expect(objtc.RefType).toBeFalsy();
    expect(objtc.TagTerm).toBeFalsy();
  });

  it('parse data', () => {
    objtc.parseData({
      Tag: 'aaa',
      Count: 10,
      RefType: 'ExerciseItem',
    });
    expect(objtc.TagTerm).toEqual('aaa');
    expect(objtc.Count).toEqual(10);
  });
});

describe('TagCountByRefType', () => {
  let objtc: TagCountByRefType;

  beforeEach(() => {
    objtc = new TagCountByRefType();
  });

  it('parse data', () => {
    objtc.parseData({
      Count: 10,
      RefType: 'ExerciseItem',
    });
    expect(objtc.Count).toEqual(10);
  });
});
