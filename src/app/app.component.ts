import { Component, OnInit } from '@angular/core';
import { MdEditorOption } from 'ngx-markdown-editor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'knowledgebuilder';
  public options: MdEditorOption = {
    enablePreviewContentClick: false,
    resizable: true
  };
  public content: string;
  public mode: string = 'editor';

  ngOnInit(): void {
  }
}
