import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';
import { MarkdownModule } from 'ngx-markdown';

import { AppUIModule } from 'src/app/app-ui.module';
import { MaterialModulesModule } from 'src/app/material-modules';
import { HighSchoolRoutingModule } from './high-school-routing.module';
import { JuniorMathComponent } from './junior-math';
import { SeniorMathComponent } from './senior-math';
import { SeniorPhysicsComponent } from './senior-physics';
import { ItemDisplayComponent } from './item-display';

@NgModule({
  declarations: [JuniorMathComponent, SeniorMathComponent, SeniorPhysicsComponent, ItemDisplayComponent],
  imports: [
    CommonModule,
    MaterialModulesModule,
    MarkdownModule.forChild(),
    TranslocoModule,
    AppUIModule,

    HighSchoolRoutingModule,
  ],
})
export class HighSchoolModule {}
