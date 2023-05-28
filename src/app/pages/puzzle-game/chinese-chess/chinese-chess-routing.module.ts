import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChineseChessComponent } from './chinese-chess/chinese-chess.component';

const routes: Routes = [
  { path: '', component: ChineseChessComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChineseChessRoutingModule { }
