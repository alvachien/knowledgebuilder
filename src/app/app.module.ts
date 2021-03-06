import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, ExpertAccessCodeDialog } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModulesModule } from './material-modules';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { translocoLoader } from './transloco-loader';
import { translocoConfig, TranslocoModule, TRANSLOCO_CONFIG } from '@ngneat/transloco';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { ODataService, QuizService } from './services';
import { environment } from 'src/environments/environment';
import { NavItemFilterPipe } from './pipes';
import { QuizFailureDailogComponent } from './pages/quiz-failure-dailog';

@NgModule({
  declarations: [
    AppComponent,
    ExpertAccessCodeDialog,
    NavItemFilterPipe,
    QuizFailureDailogComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoModule,
    MonacoEditorModule, // .forRoot(),
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
  providers: [
    ODataService,
    QuizService,
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'zh'],
        defaultLang: 'zh',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      })
    },
    translocoLoader,
  ],
  // entryComponents: [
  //   QuizFailureDailogComponent
  // ],
  bootstrap: [AppComponent]
})
export class AppModule { }
