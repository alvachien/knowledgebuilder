import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarkedDownEditorComponentComponent } from './marked-down-editor-component/marked-down-editor-component.component';

@NgModule({
  declarations: [
    AppComponent,
    MarkedDownEditorComponentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
