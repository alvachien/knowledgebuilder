import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';

import { ACMarkdownEditorComponent } from './acmarkdown-editor/acmarkdown-editor.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

@NgModule({
  declarations: [
    ACMarkdownEditorComponent,
    MessageDialogComponent,
  ],
  imports: [
    CommonModule,
    NzModalModule,
  ],
  exports: [
    ACMarkdownEditorComponent,
    MessageDialogComponent,
  ]
})
export class ReusableComponentModule { }
