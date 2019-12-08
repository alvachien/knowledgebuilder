import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnglishWordComponent } from './english-word.component';

const routes: Routes = [
  { path: '', component: EnglishWordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnglishWordRoutingModule { }
