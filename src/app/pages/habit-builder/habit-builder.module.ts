import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HabitBuilderRoutingModule } from './habit-builder-routing.module';
import { HabitListComponent } from './habit-list/habit-list.component';
import { HabitDetailComponent } from './habit-detail/habit-detail.component';
import { HabitRecordListComponent } from './habit-record-list/habit-record-list.component';
import { HabitRecordDetailComponent } from './habit-record-detail/habit-record-detail.component';


@NgModule({
  declarations: [
    HabitListComponent,
    HabitDetailComponent,
    HabitRecordListComponent,
    HabitRecordDetailComponent
  ],
  imports: [
    CommonModule,
    HabitBuilderRoutingModule
  ]
})
export class HabitBuilderModule { }
