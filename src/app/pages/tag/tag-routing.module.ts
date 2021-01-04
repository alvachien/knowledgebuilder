import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TagComponent } from './tag.component';
import { TagDetailComponent } from './tag-detail';

const routes: Routes = [
  { path: '', component: TagComponent },
  { path: 'display/:content', component: TagDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagRoutingModule { }
