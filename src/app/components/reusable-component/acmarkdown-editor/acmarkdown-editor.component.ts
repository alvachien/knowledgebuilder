import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { ACMarkdownEditor } from './acmarkdown-editor';

@Component({
  selector: 'app-acmarkdown-editor',
  templateUrl: './acmarkdown-editor.component.html',
  styleUrls: ['./acmarkdown-editor.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class ACMarkdownEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('acme_editor', {static: false}) editorInstance: ElementRef;
  instanceEditor: ACMarkdownEditor;

  constructor() { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.instanceEditor = new ACMarkdownEditor('test1', this.editorInstance.nativeElement);
  }
  ngOnDestroy() {

  }
}
