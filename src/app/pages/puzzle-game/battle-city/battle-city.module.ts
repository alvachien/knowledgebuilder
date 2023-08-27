import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';
import { MaterialModulesModule } from 'src/app/material-modules';

import { BattleCityRoutingModule } from './battle-city-routing.module';
import { BattleCityComponent } from './battle-city/battle-city.component';

@NgModule({
  declarations: [BattleCityComponent],
  imports: [CommonModule, FormsModule, MaterialModulesModule, TranslocoModule, BattleCityRoutingModule],
})
export class BattleCityModule {}
