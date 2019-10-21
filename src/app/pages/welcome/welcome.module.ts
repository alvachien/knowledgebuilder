import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { WelcomeComponent } from './welcome.component';

@NgModule({
  imports: [
    WelcomeRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [WelcomeComponent],
  exports: [WelcomeComponent]
})
export class WelcomeModule { }
