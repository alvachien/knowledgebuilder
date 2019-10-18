import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReusableComponentModule } from '../../components/reusable-component/reusable-component.module';

import { MarkdownEditorExampleComponent } from './markdown-editor-example.component';
import { MarkdownEditorExampleRoutingModule } from './markdown-editor-example-routing.module';

@NgModule({
  declarations: [MarkdownEditorExampleComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReusableComponentModule,
    MarkdownEditorExampleRoutingModule,
  ],
  exports: [
    MarkdownEditorExampleComponent
  ]
})
export class MarkdownEditorExampleModule { }
