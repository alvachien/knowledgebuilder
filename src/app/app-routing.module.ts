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
    path: 'question-bank-item',
    loadChildren: () => import('./pages/question-bank-items/question-bank-items.module').then(m => m.QuestionBankItemsModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
