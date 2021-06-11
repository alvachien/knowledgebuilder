import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OverviewComponent } from './overview/overview.component';
import { AwardRuleComponent } from './award-rule/award-rule.component';
import { DailyActivityComponent } from './daily-activity/daily-activity.component';

const routes: Routes = [
  { path: '', component:  OverviewComponent },
  { path: 'rules', component:  AwardRuleComponent },
  { path: 'dailyact', component:  DailyActivityComponent },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AwardRoutingModule { }
