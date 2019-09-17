import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ACMEditor } from './ac-markdown-editor';

@Component({
  selector: 'app-ac-markdown-editor',
  templateUrl: './ac-markdown-editor.component.html',
  styleUrls: ['./ac-markdown-editor.component.scss'],
})
export class AcMarkdownEditorComponent implements OnInit {
  private editor: ACMEditor;

  @ViewChild('acmdeditor', { static: true }) public elemEditor: ElementRef;

  constructor() { }

  ngOnInit() {
    this.editor = new ACMEditor(this.elemEditor.nativeElement, {
      counter: 100,
      height: 300,
      // hint: {
      //   emojiPath: 'assets/images/emoji',
      //   emoji: {
      //     // tslint:disable-next-line:object-literal-key-quotes
      //     'sd': '💔',
      //     // tslint:disable-next-line:object-literal-key-quotes
      //     'j': 'j',
      //   },
      // },
      tab: '\t',
      upload: {
        accept: 'image/*,.wav',
        token: 'test',
        url: '/api/upload/editor',
        linkToImgUrl: '/api/upload/fetch',
        filename(name) {
          // ? \ / : | < > * [ ] white to -
          return name.replace(/[^(a-zA-Z0-9\u4e00-\u9fa5\.)]/g, '').
            replace(/[\?\\/:|<>\*\[\]\(\)\$%\{\}@~]/g, '').
            replace('/\\s/g', '');
        },
      },
      preview: {
        mode: 'both',
      },
    });
  }
}
