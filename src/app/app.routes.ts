import type { Routes } from '@angular/router';

import { AuthGuardService } from './services/auth-guard.service';

const routeConfig: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/homepage').then(m => m.HomepageComponent),
  },
  {
    path: 'signin-callback',
    loadComponent: () => import('./pages/signin-callback').then(m => m.SigninCallbackComponent),
  },
  {
    path: 'vocabulary',
    canActivate: [AuthGuardService],
    loadComponent: () =>
      import('./pages/vocabulary-exercises').then(m => m.VocabularyExercisesComponent),
  },
  {
    path: 'translating',
    canActivate: [AuthGuardService],
    loadComponent: () =>
      import('./pages/translate-exercises').then(m => m.TranslateExercisesComponent),
  },
  {
    path: 'listening',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./pages/english-listening').then(m => m.EnglishListeningComponent),
  },
  {
    path: 'chinese',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./pages/chinese-exercises/chinese-exercises.routes').then(
        m => m.CHINESE_EXERCISES_ROUTES
      ),
  },
  {
    path: 'formula',
    canActivate: [AuthGuardService],
    loadComponent: () => import('./pages/formula-recites').then(m => m.FormulaRecitesComponent),
  },
  {
    path: 'knowledge',
    canActivate: [AuthGuardService],
    loadChildren: () =>
      import('./pages/knowledge-exercises/knowledge-exercises.routers').then(
        m => m.KNOWLEDGE_EXERCISES_ROUTES
      ),
  },
  {
    path: 'user-detail',
    canActivate: [AuthGuardService],
    loadComponent: () =>
      import('./pages/user-detail').then(m => m.UserDetailComponent),
  },
  {
    path: '404',
    loadComponent: () => import('./pages/not-found').then(m => m.NotFoundComponent),
  },
  { path: '**', redirectTo: '/404' },
];

export default routeConfig;
