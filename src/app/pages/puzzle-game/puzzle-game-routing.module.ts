import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PuzzleGameComponent } from './puzzle-game';
import { Calculate24Component } from './calculate24';
import { GobangGameComponent } from './gobang-game';
import { TypingGameComponent } from './typing-game';
import { SudouComponent } from './sudou';

const routes: Routes = [
  { path: '', component: PuzzleGameComponent },
  { path: 'cal24', component: Calculate24Component },
  { path: 'gobang', component: GobangGameComponent },
  { path: 'typegame', component: TypingGameComponent },
  { path: 'sudou', component: SudouComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PuzzleGameRoutingModule {}
