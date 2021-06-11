import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { AppUIModule } from 'src/app/app-ui.module';
import { AwardRoutingModule } from './award-routing.module';
import { AwardRuleComponent } from './award-rule/award-rule.component';
import { DailyActivityComponent } from './daily-activity/daily-activity.component';
import { OverviewComponent } from './overview/overview.component';


@NgModule({
  declarations: [
    AwardRuleComponent,
    DailyActivityComponent,
    OverviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    TranslocoModule,
    AppUIModule,
    AwardRoutingModule
  ]
})
export class AwardModule { }
