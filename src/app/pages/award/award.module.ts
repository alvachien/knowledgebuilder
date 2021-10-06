import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { AppUIModule } from 'src/app/app-ui.module';
import { AwardRoutingModule } from './award-routing.module';
import { AwardRuleComponent, } from './award-rule/award-rule.component';
import { OverviewComponent, AwardPointCreateDialog } from './overview/overview.component';
import { DailyTraceComponent, DailyTraceCreateDialog, } from './daily-trace/daily-trace.component';
import { AwardRuleGenerationComponent } from './award-rule-generation/award-rule-generation.component';


@NgModule({
  declarations: [
    AwardRuleComponent,
    OverviewComponent,
    DailyTraceComponent,
    DailyTraceCreateDialog,
    AwardPointCreateDialog,
    AwardRuleGenerationComponent,
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
