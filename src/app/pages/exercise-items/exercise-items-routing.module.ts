import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExerciseItemsComponent } from './exercise-items.component';
import { ExerciseItemDetailComponent } from './exercise-item-detail';

const routes: Routes = [
  { path: '', component: ExerciseItemsComponent },
  { path: 'create', component: ExerciseItemDetailComponent },
  { path: 'display/:id', component: ExerciseItemDetailComponent },
  { path: 'edit/:id', component: ExerciseItemDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExerciseItemsRoutingModule { }
