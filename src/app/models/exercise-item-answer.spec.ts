
import { ExerciseItemAnswer } from './exercise-item-answer';

describe('ExerciseItemAnswer', () => {
    it('test it', () => {
        let obj = new ExerciseItemAnswer();
        obj.Content = 'test';
        obj.ID = 1;
        expect(obj).toBeTruthy();
        expect(obj.ID).toEqual(1);
        expect(obj.Content).toEqual('test');
    });
});
