import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@ngneat/transloco';

import { MaterialModulesModule } from 'src/app/material-modules';
import { PuzzleGameRoutingModule } from './puzzle-game-routing.module';
import { PuzzleGameComponent } from './puzzle-game';
import { TypingGameComponent } from './typing-game';
import { Calculate24Component } from './calculate24';
import { GobangGameComponent } from './gobang-game';
import { SudouComponent } from './sudou';

@NgModule({
  declarations: [
    PuzzleGameComponent,
    TypingGameComponent,
    Calculate24Component,
    GobangGameComponent,
    SudouComponent,
  ],
  imports: [
    CommonModule,
    MaterialModulesModule,
    PuzzleGameRoutingModule,
    TranslocoModule,
    FormsModule,
  ]
})
export class PuzzleGameModule { }
