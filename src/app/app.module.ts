import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent, CurrentUserDialog } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModulesModule } from './material-modules';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { translocoLoader } from './transloco-loader';
import { translocoConfig, TranslocoModule, TRANSLOCO_CONFIG } from '@ngneat/transloco';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { ODataService, QuizService, UIUtilityService, AuthGuardService } from './services';
import { environment } from 'src/environments/environment';
import { NavItemFilterPipe } from './pipes';
import { QuizFailureDailogComponent } from './pages/quiz-failure-dailog';
import { AuthConfigModule } from './auth/auth-config.module';
import { NuMonacoEditorModule } from '@ng-util/monaco-editor';

@NgModule({
  declarations: [AppComponent, CurrentUserDialog, NavItemFilterPipe, QuizFailureDailogComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslocoModule,
    NuMonacoEditorModule.forRoot({
      baseUrl: `assets`,
    }),
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
    NgxEchartsModule.forRoot({
      echarts,
    }),
    AuthConfigModule,
  ],
  providers: [
    ODataService,
    UIUtilityService,
    QuizService,
    AuthGuardService,
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['en', 'zh'],
        defaultLang: 'zh',
        reRenderOnLangChange: true,
        prodMode: environment.production,
      }),
    },
    translocoLoader,
  ],
  // entryComponents: [
  //   QuizFailureDailogComponent
  // ],
  bootstrap: [AppComponent],
})
export class AppModule {}
