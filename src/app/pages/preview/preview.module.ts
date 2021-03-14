import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { PreviewRoutingModule } from './preview-routing.module';
import { PreviewComponent } from './preview.component';
import { MarkdownModule } from 'ngx-markdown';


@NgModule({
  declarations: [
    PreviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    MaterialModulesModule,
    MarkdownModule,
    PreviewRoutingModule
  ]
})
export class PreviewModule { }
