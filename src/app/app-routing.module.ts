import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) },
  {
    path: 'knowledge-item',
    loadChildren: () => import('./pages/knowledge-items/knowledge-items.module').then(m => m.KnowledgeItemsModule),
  },
  {
    path: 'exercise-item',
    loadChildren: () => import('./pages/exercise-items/exercise-items.module').then(m => m.ExerciseItemsModule),
  },
  {
    path: 'tag',
    loadChildren: () => import('./pages/tag/tag.module').then(m => m.TagModule),
  },
  {
    path: 'help',
    loadChildren: () => import('./pages/help/help.module').then(m => m.HelpModule),
  },
  {
    path: 'primary-school-math',
    loadChildren: () => import('./pages/primary-school-math/primary-school-math.module').then(m => m.PrimarySchoolMathModule),
  },
  {
    path: 'puzzle-games',
    loadChildren: () => import('./pages/puzzle-game/puzzle-game.module').then(m => m.PuzzleGameModule),
  },
  {
    path: 'quiz-summary',
    loadChildren: () => import('./pages/quiz-summary/quiz-summary.module').then(m => m.QuizSummaryModule),
  },
  {
    path: 'award',
    loadChildren: () => import('./pages/award/award.module').then(m => m.AwardModule),
  },
  {
    path: 'preview',
    loadChildren: () => import('./pages/preview/preview.module').then(m => m.PreviewModule),
  },
  {
    path: '**',
    loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
