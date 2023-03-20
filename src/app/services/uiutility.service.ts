import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { TagReferenceType, UserHabitRecordView } from '../models';

export interface PreviewObject {
  refType: TagReferenceType;
  refId: number;
}

@Injectable({
  providedIn: 'root',
})
export class UIUtilityService {
  // Preview objects
  previewObjList: PreviewObject[] = [];
  // Habit User Record
  currentUserHabitRecord: UserHabitRecordView | null = null;

  constructor(private router: Router, private snack: MatSnackBar) {}

  public navigateExerciseItemListPage(): void {
    this.router.navigate(['exercise-item']);
  }
  public navigateExerciseItemCreatePage(): void {
    this.router.navigate(['exercise-item', 'create']);
  }
  public navigateExerciseItemDisplayPage(execid: number): void {
    this.router.navigate(['exercise-item', 'display', execid.toString()]);
  }
  public navigateExerciseItemChangePage(execid: number): void {
    this.router.navigate(['exercise-item', 'edit', execid.toString()]);
  }
  public navigateExerciseItemSearchPage(): void {
    this.router.navigate(['exercise-item', 'search']);
  }
  public navigatePreviewPage(prvobjs: PreviewObject[]): void {
    this.previewObjList = prvobjs.slice();
    this.router.navigate(['preview']);
  }
  public navigateKnowledgeItemListPage(): void {
    this.router.navigate(['knowledge-item']);
  }
  public navigateKnowledgeItemCreatePage(): void {
    this.router.navigate(['knowledge-item', 'create']);
  }
  public navigateKnowledgeItemDisplayPage(kid: number): void {
    this.router.navigate(['knowledge-item', 'display', kid.toString()]);
  }
  public navigateKnowledgeItemChangePage(kid: number): void {
    this.router.navigate(['knowledge-item', 'edit', kid.toString()]);
  }
  public navigateKnowledgeItemSearchPage(): void {
    this.router.navigate(['knowledge-item', 'search']);
  }
  public navigateUserCollectionListPage(): void {
    this.router.navigate(['user-collection']);
  }
  public navigateUserCollectionCreatePage(): void {
    this.router.navigate(['user-collection', 'create']);
  }
  public navigateUserCollectionChangePage(collid: number): void {
    this.router.navigate(['user-collection', 'edit', collid.toString()]);
  }
  public navigateUserCollectionDisplayPage(collid: number): void {
    this.router.navigate(['user-collection', 'display', collid.toString()]);
  }
  public navigateAwardRuleGenerationPage(): void {
    this.router.navigate(['award', 'rule-generation']);
  }
  public navigateAwardRuleGroupListPage(): void {
    this.router.navigate(['award', 'rules']);
  }
  public navigateAwardRuleGroupDisplayPage(gid: number): void {
    this.router.navigate(['award', 'rule-group-display', gid.toString()]);
  }

  public navigateHabitListPage(): void {
    this.router.navigate(['habit', 'list']);
  }
  public navigateHabitCreatePage(): void {
    this.router.navigate(['habit', 'create']);
  }
  public navigateHabitDisplayPage(hid: number): void {
    this.router.navigate(['habit', 'display', hid.toString()]);
  }
  public navigateHabitRecordListPage(): void {
    this.router.navigate(['habit', 'record', 'list']);
  }
  public navigateHabitRecordCreatePage(): void {
    this.router.navigate(['habit', 'record', 'create']);
  }
  public navigateHabitRecordDisplayPage(): void {
    this.router.navigate(['habit', 'record', 'display']);
  }
  public clearHabitRecordDisplay() {
    this.currentUserHabitRecord = null;
  }

  public showSnackInfo(info: string, duration = 2000): void {
    this.snack.open(info, undefined, { duration });
  }
}
