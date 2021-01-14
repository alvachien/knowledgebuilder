import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AboutComponent } from './about';
import { CreditsComponent } from './credits';
import { HelpComponent } from './help.component';

const routes: Routes = [
  { path: '', component: HelpComponent },
  { path: 'about', component: AboutComponent },
  { path: 'credits', component: CreditsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HelpRoutingModule { }
