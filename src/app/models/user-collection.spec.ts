import { UserCollection } from ".";

describe('UserCollection', () => {
    it('set and get data', () => {
        const obj = new UserCollection();
        obj.Comment = 'test';
        obj.Name = 'test';
        obj.User = 'test';
        expect(obj).toBeTruthy();

        let wrtobj = obj.writeJSONString();
        expect(wrtobj).toBeTruthy();
    });
});
