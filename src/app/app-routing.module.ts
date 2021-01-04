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
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
