import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { HelpComponent } from './help.component';
import { AboutComponent } from './about';
import { CreditsComponent } from './credits';
import { HelpRoutingModule } from './help-routing.module';

@NgModule({
  declarations: [HelpComponent, AboutComponent, CreditsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    HelpRoutingModule,
    TranslocoModule,
  ],
})
export class HelpModule {}
