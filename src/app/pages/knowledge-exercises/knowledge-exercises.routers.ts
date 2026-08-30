import type { Routes } from '@angular/router';

import { KnowledgeExercisesDetailV2Component } from './knowledge-exercises-detail-v2';
import { KnowledgeExercisesComponent } from './knowledge-exercises-list';

export const KNOWLEDGE_EXERCISES_ROUTES: Routes = [
  {
    path: '',
    component: KnowledgeExercisesComponent
  },
  {
    path: 'displayv2',
    component: KnowledgeExercisesDetailV2Component
  }
];
