import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChineseChessRoutingModule } from './chinese-chess-routing.module';
import { ChineseChessComponent } from './chinese-chess/chinese-chess.component';

@NgModule({
  declarations: [
    ChineseChessComponent
  ],
  imports: [
    CommonModule,
    ChineseChessRoutingModule
  ]
})
export class ChineseChessModule { }
