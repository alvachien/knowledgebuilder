import { UserCollection, UserCollectionItem } from '.';

describe('UserCollectionItem', () => {
  let objtc: UserCollectionItem;

  beforeEach(() => {
    objtc = new UserCollectionItem();
  });

  it('default value', () => {
    expect(objtc.ID).toEqual(-1);
    expect(objtc.RefID).toEqual(-1);
  });

  it('parse data', () => {
    objtc.parseData({
      ID: 12,
      RefType: 'KnowledgeItem',
      RefID: 11,
      CreatedAt: '2022-01-02',
    });
    expect(objtc.ID).toEqual(12);
    expect(objtc.CreatedAt).toBeTruthy();

    const objstr = objtc.writeJSONString();
    expect(objstr).toBeTruthy();
  });
});

describe('UserCollection', () => {
  let objtc: UserCollection;
  beforeEach(() => {
    objtc = new UserCollection();
  });

  it('default value', () => {
    expect(objtc.ID).toEqual(-1);
  });

  it('parse data', () => {
    objtc.parseData({
      ID: 12,
      User: 'test',
      Name: 'test',
      Comment: 'tres',
      CreatedAt: '2022-01-02',
      ModifiedAt: '2023-01-02',
      Items: [
        {
          ID: 12,
          RefType: 'KnowledgeItem',
          RefID: 11,
          CreatedAt: '2022-01-02',
        },
      ],
    });

    expect(objtc.CreatedAt).toBeTruthy();
    expect(objtc.ModifiedAt).toBeTruthy();
    expect(objtc.Items.length).toEqual(1);
    expect(objtc.Name).toEqual('test');

    const objstr = objtc.writeJSONString();
    expect(objstr).toBeTruthy();
  });

  it('write json data', () => {
    objtc.Comment = 'test';
    objtc.Name = 'test';
    objtc.User = 'test';

    const wrtobj = objtc.writeJSONString();
    expect(wrtobj).toBeTruthy();
  });
});
