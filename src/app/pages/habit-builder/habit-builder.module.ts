import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { AppUIModule } from 'src/app/app-ui.module';

import { HabitBuilderRoutingModule } from './habit-builder-routing.module';
import { HabitListComponent } from './habit-list/habit-list.component';
import { HabitDetailComponent } from './habit-detail/habit-detail.component';
import { HabitRecordListComponent } from './habit-record-list/habit-record-list.component';
import { HabitRecordDetailComponent } from './habit-record-detail/habit-record-detail.component';
import { HabitCreateComponent } from './habit-create/habit-create.component';


@NgModule({
  declarations: [
    HabitListComponent,
    HabitDetailComponent,
    HabitRecordListComponent,
    HabitRecordDetailComponent,
    HabitCreateComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    TranslocoModule,
    AppUIModule,
    HabitBuilderRoutingModule
  ]
})
export class HabitBuilderModule { }
