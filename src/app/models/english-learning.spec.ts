//
// Unit test for english-learning.ts
//

import { EnglishPartsofSpeechEnum, EnglishWord, EnglishSentence, EnglishWordExplaination
} from './english-learning';

describe('EnglishWordExplaination', () => {
    let testobj: EnglishWordExplaination;

    beforeEach(() => {
        testobj = new EnglishWordExplaination();
    });

    it('test attributes', () => {
        expect(testobj).toBeTruthy();
        testobj.expidx = 1;
        testobj.explain = 'test';
        expect(testobj.explain).toBeTruthy();
    });
});
