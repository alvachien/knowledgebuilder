import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { AppUIModule } from 'src/app/app-ui.module';

import { HabitBuilderRoutingModule } from './habit-builder-routing.module';
import { HabitListComponent } from './habit-list';
import { HabitDetailComponent } from './habit-detail';
import { HabitRecordListComponent } from './habit-record-list';
import { HabitRecordDetailComponent } from './habit-record-detail';
import { HabitCreateComponent } from './habit-create';
import { HabitRecordCreateComponent } from './habit-record-create';
import { HabitPointsListComponent } from './habit-points-list';


@NgModule({
  declarations: [
    HabitListComponent,
    HabitDetailComponent,
    HabitRecordListComponent,
    HabitRecordDetailComponent,
    HabitCreateComponent,
    HabitRecordCreateComponent,
    HabitPointsListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    TranslocoModule,
    AppUIModule,
    HabitBuilderRoutingModule
  ]
})
export class HabitBuilderModule { }
