import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';
import { AwardRuleComponent } from './award-rule/award-rule.component';
import { DailyTraceComponent } from './daily-trace/daily-trace.component';

const routes: Routes = [
  { path: '', component:  OverviewComponent },
  { path: 'rules', component:  AwardRuleComponent },
  { path: 'dailytrace', component: DailyTraceComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AwardRoutingModule { }
