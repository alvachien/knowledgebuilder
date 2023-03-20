import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModulesModule } from '../material-modules';

import { UIUtilityService } from './uiutility.service';
import { Router } from '@angular/router';

describe('UIUtilityService', () => {
  let service: UIUtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MaterialModulesModule,
      ],
    });
    service = TestBed.inject(UIUtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('navigateExerciseItemListPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateExerciseItemListPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['exercise-item']);
  });

  it('navigateExerciseItemCreatePage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateExerciseItemCreatePage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'exercise-item',
      'create',
    ]);
  });

  it('navigateExerciseItemDisplayPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    service.navigateExerciseItemDisplayPage(2);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'exercise-item',
      'display',
      '2',
    ]);
  });

  it('navigateExerciseItemChangePage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    service.navigateExerciseItemChangePage(2);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'exercise-item',
      'edit',
      '2',
    ]);
  });

  it('navigateExerciseItemSearchPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    service.navigateExerciseItemSearchPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'exercise-item',
      'search',
    ]);
  });

  it('navigatePreviewPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    service.navigatePreviewPage([]);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['preview']);
  });

  it('navigateKnowledgeItemListPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateKnowledgeItemListPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['knowledge-item']);
  });

  it('navigateKnowledgeItemCreatePage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateKnowledgeItemCreatePage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'knowledge-item',
      'create',
    ]);
  });

  it('navigateKnowledgeItemDisplayPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateKnowledgeItemDisplayPage(2);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'knowledge-item',
      'display',
      '2',
    ]);
  });

  it('navigateKnowledgeItemChangePage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateKnowledgeItemChangePage(2);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'knowledge-item',
      'edit',
      '2',
    ]);
  });

  it('navigateKnowledgeItemSearchPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateKnowledgeItemSearchPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'knowledge-item',
      'search',
    ]);
  });

  it('navigateUserCollectionListPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateUserCollectionListPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['user-collection']);
  });

  it('navigateUserCollectionCreatePage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateUserCollectionCreatePage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'user-collection',
      'create',
    ]);
  });

  it('navigateUserCollectionChangePage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateUserCollectionChangePage(2);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'user-collection',
      'edit',
      '2',
    ]);
  });

  it('navigateUserCollectionDisplayPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateUserCollectionDisplayPage(2);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'user-collection',
      'display',
      '2',
    ]);
  });

  it('navigateAwardRuleGenerationPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateAwardRuleGenerationPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'award',
      'rule-generation',
    ]);
  });

  it('navigateAwardRuleGroupListPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateAwardRuleGroupListPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['award', 'rules']);
  });

  it('navigateAwardRuleGroupDisplayPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateAwardRuleGroupDisplayPage(2);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'award',
      'rule-group-display',
      '2',
    ]);
  });

  it('navigateHabitListPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateHabitListPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['habit', 'list']);
  });

  it('navigateHabitCreatePage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateHabitCreatePage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['habit', 'create']);
  });

  it('navigateHabitDisplayPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateHabitDisplayPage(2);

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['habit', 'display', '2']);
  });

  it('navigateHabitRecordListPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateHabitRecordListPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'habit',
      'record',
      'list',
    ]);
  });

  it('navigateHabitRecordCreatePage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateHabitRecordCreatePage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'habit',
      'record',
      'create',
    ]);
  });

  it('navigateHabitRecordDisplayPage shall work', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');
    service.navigateHabitRecordDisplayPage();

    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith([
      'habit',
      'record',
      'display',
    ]);
  });

  it('clearHabitRecordDisplay shall work', () => {
    service.clearHabitRecordDisplay();
    expect(service.currentUserHabitRecord).toBeFalsy();
  });
});
