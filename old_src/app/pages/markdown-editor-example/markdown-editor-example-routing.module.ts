import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MarkdownEditorExampleComponent } from './markdown-editor-example.component';

const routes: Routes = [
  { path: '', component: MarkdownEditorExampleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarkdownEditorExampleRoutingModule { }
