import { InvitedUser } from './inviteduser';

describe('InvitedUser', () => {
    let objtbt: InvitedUser;

    beforeEach(() => {
        objtbt = new InvitedUser();
    });

    it('basic', () => {
        expect(objtbt).toBeTruthy();

        let rst = objtbt.createdAtString;
        expect(rst).toBeTruthy();
        rst = objtbt.lastLogonAtString;
        expect(rst).toBeTruthy();
    });

    it('parseData', () => {
        objtbt.parseData({
            'UserID': 'aaa',
            'UserName': 'aaa',
            'DisplayAs': 'AAA',
            'CreatedAt': '2022-01-01',
            'LastLoginAt': '2022-02-02',
            'AwardUsers': [{
                'UserName': 'bbb',
                'DisplayAs': 'BBB'
            }]
        });
        expect(objtbt.userID).toEqual('aaa');
        expect(objtbt.userName).toEqual('aaa');
        expect(objtbt.awardUsers.length).toEqual(1);
    });
});
