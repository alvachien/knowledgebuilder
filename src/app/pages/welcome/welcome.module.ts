import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WelcomeRoutingModule } from './welcome-routing.module';
import { WelcomeComponent } from './welcome.component';


@NgModule({
  declarations: [WelcomeComponent],
  imports: [
    CommonModule,
  ]
})
export class WelcomeModule { }
