import { Component, OnInit } from '@angular/core';

// tslint:disable-next-line no-any
declare const monaco: any;
import { editor } from 'monaco-editor';

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss']
})
export class MarkdownEditorComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('Entering MarkdownEditorComponent OnInit');
  }

  onEditorInit(e: editor.ICodeEditor): void {
    console.log('Entering MarkdownEditorComponent onEditorInit');
  }
}
