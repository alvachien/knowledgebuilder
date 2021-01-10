import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { TagRoutingModule } from './tag-routing.module';
import { TagComponent } from './tag.component';
import { TagDetailComponent } from './tag-detail';

@NgModule({
  declarations: [
    TagComponent,
    TagDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    TagRoutingModule,
    TranslocoModule,
  ],
})
export class TagModule { }
