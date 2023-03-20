import { KnowledgeItem, KnowledgeItemCategory } from './knowledge-item';

describe('KnowledgeItem', () => {
  let objtbt: KnowledgeItem;

  beforeEach(() => {
    objtbt = new KnowledgeItem();
  });

  it('basic', () => {
    objtbt.ID = 1;
    objtbt.Content = 'aaa';
    objtbt.Title = 'aaa';
    objtbt.ItemCategory = KnowledgeItemCategory.Concept;
    const gstr = objtbt.generateString(true);
    expect(gstr).toBeTruthy();

    const test2 = new KnowledgeItem();
    test2.parseData(gstr);
    expect(test2).toBeTruthy();
  });
});
