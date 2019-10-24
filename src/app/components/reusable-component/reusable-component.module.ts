import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { ACMarkdownEditorComponent } from './acmarkdown-editor/acmarkdown-editor.component';
import { MessageDialogComponent } from './message-dialog/message-dialog.component';

@NgModule({
  declarations: [
    ACMarkdownEditorComponent,
    MessageDialogComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),

    NzModalModule,
    NzButtonModule,
  ],
  exports: [
    ACMarkdownEditorComponent,
    MessageDialogComponent,
  ]
})
export class ReusableComponentModule { }
