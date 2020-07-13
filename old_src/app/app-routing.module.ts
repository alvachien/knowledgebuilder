import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/welcome' },
  { path: 'welcome', loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomeModule) },
  { path: 'func-curve', loadChildren: () => import('./pages/function-curve/function-curve.module').then(m => m.FunctionCurveModule) },
  { path: 'english-word', loadChildren: () => import('./pages/english-word/english-word.module').then(m => m.EnglishWordModule) },
  // tslint:disable-next-line:max-line-length
  { path: 'mddoc-test', loadChildren: () => import('./pages/markdown-editor-example/markdown-editor-example.module').then(m => m.MarkdownEditorExampleModule) },
  { path: 'knowledge', loadChildren: () => import('./pages/knowledge/knowledge.module').then(m => m.KnowledgeModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
