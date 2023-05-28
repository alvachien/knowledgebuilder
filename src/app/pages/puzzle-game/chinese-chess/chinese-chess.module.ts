import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ChineseChessRoutingModule } from './chinese-chess-routing.module';
import { ChineseChessComponent } from './chinese-chess/chinese-chess.component';
import { TranslocoModule } from '@ngneat/transloco';
import { MaterialModulesModule } from 'src/app/material-modules';

@NgModule({
  declarations: [ChineseChessComponent],
  imports: [CommonModule, FormsModule, MaterialModulesModule, TranslocoModule, ChineseChessRoutingModule],
})
export class ChineseChessModule {}
