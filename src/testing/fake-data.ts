import { User } from 'oidc-client';
import * as moment from 'moment';

import { ExerciseItem, ExerciseItemType, InvitedUser, KnowledgeItem, KnowledgeItemCategory,
    UserAuthInfo } from 'src/app/models';

export class FakeData {
    readonly userID1: string = 'abcdefg';
    readonly userID1Sub: string = '12345abcdefg';
    readonly userID1Name: string = 'Tester';

    private currUser: UserAuthInfo | null = null;
    private currUserDetail: InvitedUser | null = null;

    private listKnowledgeItems: KnowledgeItem[] = [];
    private listExerciseItems: ExerciseItem[] = [];

    constructor() {
        // Empty
    }

    get currentUser(): UserAuthInfo | null {
        return this.currUser;
    }
    get currentUserDetail(): InvitedUser | null {
        return this.currUserDetail;
    }

    get knowledgeItems(): KnowledgeItem[] {
        return this.listKnowledgeItems;
    }
    get exerciseItems(): ExerciseItem[] {
        return this.listExerciseItems;
    }

    public buildCurrentUser(): void {
        if (this.currUser === null) {
            this.currUser = new UserAuthInfo();
            const usr: any = {
                profile: {
                    name: this.userID1,
                    sub: this.userID1Sub,
                    mail: 'usr@usr.com',
                    access_token: 'access_token',
                },
            };
    
            this.currUser.setContent(usr as User);    
        }
    }
    public buildCurrentUserDetail(): void {
        if (this.currUserDetail === null) {
            this.currUserDetail = new InvitedUser();
            this.currUserDetail.displayAs = this.userID1Name;
            this.currUserDetail.userID = this.userID1;
            this.currUserDetail.userName = this.userID1Name;    
        }
    }
    public buildKnowledgeItems(): void {
        if (this.listKnowledgeItems.length <= 0) {
            const item = new KnowledgeItem();
            item.Content = 'Test 1';
            item.ID = 1;
            item.ItemCategory = KnowledgeItemCategory.Concept;
            item.Title = 'Test 1';
            this.listKnowledgeItems.push(item);
        }
    }
    public buildExerciseItems(): void {
        if (this.listExerciseItems.length <= 0) {
            const item = new ExerciseItem();
            item.Answer = 'Answer 1';
            item.Content = 'Test 1';
            item.ID = 1;
            item.ItemType = ExerciseItemType.EssayQuestions;
            this.listExerciseItems.push(item);
        }
    }
}
