import type { Routes } from '@angular/router';

// Lazy habit-tracking routes (docs/design-habit-ui.md § Routing). Mounted under
// /habits behind the app's AuthGuardService. `new` and `:id/edit` precede `:id`
// so the literal `new` path is not swallowed by the id parameter; `calendar` is
// likewise a literal that must stay above `:id`. Browser titles are set by each
// component via the AppPageTitle service (app convention).
export const HABITS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./habit-list.component').then((m) => m.HabitListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./habit-wizard.component').then((m) => m.HabitWizardComponent),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./habit-calendar.component').then((m) => m.HabitCalendarComponent),
  },
  // Shared gallery literals must stay above ':id' too (same rule as 'calendar');
  // 'shared/:id' can't collide with ':id/edit' — its second segment is literal.
  {
    path: 'shared',
    loadComponent: () => import('./shared-habit-list.component').then((m) => m.SharedHabitListComponent),
  },
  {
    path: 'shared/:id',
    loadComponent: () => import('./shared-habit-detail.component').then((m) => m.SharedHabitDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./habit-wizard.component').then((m) => m.HabitWizardComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./habit-detail.component').then((m) => m.HabitDetailComponent),
  },
];
