import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from '../../material-modules';
import { HelpComponent } from './help.component';
import { AboutComponent } from './about';
import { CreditsComponent } from './credits';
import { HelpRoutingModule } from './help-routing.module';


@NgModule({
  declarations: [
    HelpComponent,
    AboutComponent,
    CreditsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModulesModule,
    MonacoEditorModule,
    MarkdownModule.forChild(),
    HelpRoutingModule,
    TranslocoModule,
  ],
})
export class HelpModule { }
