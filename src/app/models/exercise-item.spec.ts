import { ExerciseItemType, getExerciseItemTypeName, getExerciseItemTypeNames, ExerciseItem, } from "./exercise-item";

describe('getExerciseItemTypeName', () => {
    it('Go through all enu', () => {
        const types = Object.values(ExerciseItemType);
        types.forEach(typeval => {
            let typename = getExerciseItemTypeName(typeval as ExerciseItemType);
            expect(typename).toBeTruthy();    
        });
    });
});

describe('getExerciseItemTypeNames', () => {
    it('Fetch all strings', () => {
        let arnames = getExerciseItemTypeNames();
        for (const name of arnames) {
            // expect(name.value).toBeTruthy(); //value could be 0!
            expect(name.i18nterm).toBeTruthy();
            expect(name.displaystring).toEqual('');
        }
    });
});


describe('ExerciseItem', () => {
    it('get and set data', () => {
        const item = new ExerciseItem();
        item.Answer = 'test';
        item.Content = 'test';
        item.ItemType = ExerciseItemType.EssayQuestions;
        
        let wrtobj = item.generateString();
        expect(wrtobj).toBeTruthy();
    });
});
