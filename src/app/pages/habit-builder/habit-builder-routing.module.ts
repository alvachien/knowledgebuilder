import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HabitListComponent } from './habit-list';
import { HabitDetailComponent } from './habit-detail';
import { HabitCreateComponent } from './habit-create';
import { HabitRecordListComponent } from './habit-record-list';
import { HabitRecordDetailComponent } from './habit-record-detail';
import { HabitRecordCreateComponent } from './habit-record-create';
import { HabitPointsListComponent } from './habit-points-list';

const routes: Routes = [
  { path: '', component:  HabitListComponent },
  { path: 'points', component: HabitPointsListComponent },
  { path: 'list', component: HabitListComponent },
  { path: 'create', component: HabitCreateComponent },
  { path: 'edit/:id', component: HabitDetailComponent },
  { path: 'display/:id', component: HabitDetailComponent },
  { path: 'record', component: HabitRecordListComponent },
  { path: 'record/list', component: HabitRecordListComponent },
  { path: 'record/create', component: HabitRecordCreateComponent },
  { path: 'record/edit/:id', component: HabitRecordDetailComponent },
  { path: 'record/display/:id', component: HabitRecordDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HabitBuilderRoutingModule { }
