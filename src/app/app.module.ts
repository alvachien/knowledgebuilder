import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModulesModule } from './material-modules';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { ODataService } from './services';
// import { CodeEditorComponent } from './pages/code-editor/code-editor.component';
// import { MarkdownEditorComponent } from './pages/markdown-editor/markdown-editor.component';

@NgModule({
  declarations: [
    AppComponent,
    // CodeEditorComponent,
    // MarkdownEditorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MonacoEditorModule.forRoot(),
    MarkdownModule.forRoot({
      loader: HttpClient, // optional, only if you use [src] attribute
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          gfm: true,
          breaks: false,
          pedantic: false,
          smartLists: true,
          smartypants: false,
        },
      },
    }),
    MaterialModulesModule,
  ],
  providers: [ODataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
