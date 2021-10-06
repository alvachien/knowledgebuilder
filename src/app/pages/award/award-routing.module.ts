import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent } from './overview';
import { AwardRuleComponent } from './award-rule';
import { DailyTraceComponent } from './daily-trace';
import { AwardRuleGenerationComponent } from './award-rule-generation';
import { AwardRuleDisplayComponent } from './award-rule-display';

const routes: Routes = [
  { path: '', component:  OverviewComponent },
  { path: 'rules', component:  AwardRuleComponent },
  { path: 'rule-group-display/:id', component:  AwardRuleDisplayComponent },
  { path: 'rule-generation', component:  AwardRuleGenerationComponent },
  { path: 'dailytrace', component: DailyTraceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AwardRoutingModule { }
