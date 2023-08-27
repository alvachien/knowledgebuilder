import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BattleCityComponent } from './battle-city/battle-city.component';

const routes: Routes = [{ path: '', component: BattleCityComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BattleCityRoutingModule {}
