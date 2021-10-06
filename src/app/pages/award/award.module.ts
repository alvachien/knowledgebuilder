import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { AppUIModule } from 'src/app/app-ui.module';
import { AwardRoutingModule } from './award-routing.module';
import { AwardRuleComponent, } from './award-rule';
import { OverviewComponent, AwardPointCreateDialog } from './overview';
import { DailyTraceComponent, DailyTraceCreateDialog, } from './daily-trace';
import { AwardRuleGenerationComponent } from './award-rule-generation';
import { AwardRuleDisplayComponent } from './award-rule-display';

@NgModule({
  declarations: [
    AwardRuleComponent,
    OverviewComponent,
    DailyTraceComponent,
    DailyTraceCreateDialog,
    AwardPointCreateDialog,
    AwardRuleGenerationComponent,
    AwardRuleDisplayComponent,
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
