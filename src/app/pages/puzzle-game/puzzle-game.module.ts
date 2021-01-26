import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from 'src/app/material-modules';
import { PuzzleGameRoutingModule } from './puzzle-game-routing.module';
import { PuzzleGameComponent } from './puzzle-game/puzzle-game.component';
import { TypingGameComponent } from './typing-game/typing-game.component';
import { Calculate24Component } from './calculate24/calculate24.component';
import { GobangGameComponent } from './gobang-game/gobang-game.component';


@NgModule({
  declarations: [PuzzleGameComponent, TypingGameComponent, Calculate24Component, GobangGameComponent],
  imports: [
    CommonModule,
    MaterialModulesModule,
    PuzzleGameRoutingModule,
    TranslocoModule,
  ]
})
export class PuzzleGameModule { }
