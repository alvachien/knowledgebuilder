import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';

import {
  BC_Screen_Height, BC_Screen_Width, BULLET_TYPE_ENEMY, BULLET_TYPE_PLAYER, BattleCityGlobalContext,
  BattleCityMap, GAME_STATE_INIT, GAME_STATE_MENU, GAME_STATE_OVER,
  GAME_STATE_START, GAME_STATE_WIN, KEYBOARD_DOWN, KEYBOARD_ENTER, KEYBOARD_N, KEYBOARD_P, KEYBOARD_SPACE, KEYBOARD_UP
} from 'src/app/models/battle-city';

@Component({
  selector: 'khb-battle-city',
  templateUrl: './battle-city.component.html',
  styleUrls: ['./battle-city.component.scss'],
})
export class BattleCityComponent implements AfterViewInit, OnDestroy {
  timerGame?: any;

  @ViewChild('canvasDiv', { static: true }) elementCanvasContainer: ElementRef | null = null;
  @ViewChild('stageCanvas', { static: true }) elementStageCanvas: ElementRef | null = null;
  @ViewChild('wallCanvas', { static: true }) elementWallCanvas: ElementRef | null = null;
  @ViewChild('tankCanvas', { static: true }) elementTankCanvas: ElementRef | null = null;
  @ViewChild('grassCanvas', { static: true }) elementGrassCanvas: ElementRef | null = null;
  @ViewChild('overCanvas', { static: true }) elementOverCanvas: ElementRef | null = null;

  @HostListener('window:keydown', ['$event'])
  onKeyDownEvent(e: KeyboardEvent) {
    console.debug(`Entering BattleCityComponent.onKeyDownEvent: key = ${e.key}, code = ${e.code}`);

    switch (BattleCityGlobalContext.gameState) {
      case GAME_STATE_MENU:
        if (e.key === KEYBOARD_ENTER) {
          BattleCityGlobalContext.gameState = GAME_STATE_INIT;
          // 只有一个玩家
          if (BattleCityGlobalContext.menu.playNum == 1) {
            BattleCityGlobalContext.player2!.lives = 0;
          }
        } else {
          let n = 0;
          if (e.key === KEYBOARD_DOWN) {
            n = 1;
          } else if (e.key === KEYBOARD_UP) {
            n = -1;
          }

          BattleCityGlobalContext.menu.next(n);
        }
        break;

      case GAME_STATE_START:
        if (BattleCityGlobalContext.keys.indexOf(e.key) === -1) {
          BattleCityGlobalContext.keys.push(e.key);
        }

        // 射击
        if (e.key === KEYBOARD_SPACE && BattleCityGlobalContext.player1!.lives > 0) {
          BattleCityGlobalContext.player1!.shoot(BULLET_TYPE_PLAYER);
        } else if (e.key === KEYBOARD_ENTER && BattleCityGlobalContext.player2!.lives > 0) {
          BattleCityGlobalContext.player2!.shoot(BULLET_TYPE_ENEMY);
        } else if (e.key === KEYBOARD_N) {
          BattleCityGlobalContext.nextLevel();
        } else if (e.key === KEYBOARD_P) {
          BattleCityGlobalContext.preLevel();
        }
        break;
    }
  }

  @HostListener('window:keyup', ['$event'])
  onKeyUpEvent(event: KeyboardEvent) {
    console.debug(`Entering BattleCityComponent.onKeyUpEvent`);

    if (BattleCityGlobalContext.keys.length > 0) {
      const idx = BattleCityGlobalContext.keys.indexOf(event.key);
      if (idx !== -1) {
        BattleCityGlobalContext.keys.splice(idx, 1);
      }  
    }
  }

  ngAfterViewInit(): void {
    console.debug('Entering BattleCityComponent.ngAfterViewInit');

    if (this.elementCanvasContainer !== null) {
      this.elementCanvasContainer.nativeElement.width = BC_Screen_Width; // `${BC_Screen_Width}px`;
      this.elementCanvasContainer.nativeElement.height = BC_Screen_Height; // `${BC_Screen_Height}px`;
    }
    if (this.elementStageCanvas !== null) {
      this.elementStageCanvas.nativeElement.width = BC_Screen_Width; // `${BC_Screen_Width}px`;
      this.elementStageCanvas.nativeElement.height = BC_Screen_Height; // `${BC_Screen_Height}px`;  
    }
    if (this.elementWallCanvas !== null) {
      this.elementWallCanvas.nativeElement.width = BC_Screen_Width; // `${BC_Screen_Width}px`;
      this.elementWallCanvas.nativeElement.height = BC_Screen_Height; // `${BC_Screen_Height}px`;  
    }
    if (this.elementTankCanvas !== null) {
      this.elementTankCanvas.nativeElement.width = BC_Screen_Width; // `${BC_Screen_Width}px`;
      this.elementTankCanvas.nativeElement.height = BC_Screen_Height; // `${BC_Screen_Height}px`;  
    }
    if (this.elementGrassCanvas !== null) {
      this.elementGrassCanvas.nativeElement.width = BC_Screen_Width; // `${BC_Screen_Width}px`;
      this.elementGrassCanvas.nativeElement.height = BC_Screen_Height; // `${BC_Screen_Height}px`;  
    }
    if (this.elementOverCanvas !== null) {
      this.elementOverCanvas.nativeElement.width = BC_Screen_Width; // `${BC_Screen_Width}px`;
      this.elementOverCanvas.nativeElement.height = BC_Screen_Height; // `${BC_Screen_Height}px`;  
    }

    // Global context
    if (!BattleCityGlobalContext.imageMenu) {
      BattleCityGlobalContext.imageMenu = new Image();
      BattleCityGlobalContext.imageMenu.src = 'assets/image/battlecity/menu.gif';
    }
    if (!BattleCityGlobalContext.imageResource) {
      BattleCityGlobalContext.imageResource = new Image();
      BattleCityGlobalContext.imageResource.src = 'assets/image/battlecity/tankAll.gif';
    }

    BattleCityGlobalContext.initObject(
      this.elementStageCanvas?.nativeElement.getContext('2d'),
      this.elementWallCanvas?.nativeElement.getContext('2d'),
      this.elementGrassCanvas?.nativeElement.getContext('2d'),
      this.elementTankCanvas?.nativeElement.getContext('2d'),
      this.elementOverCanvas?.nativeElement.getContext('2d')
    );

    this.timerGame = setInterval(() => this.gameLoop(), 20);
  }

  ngOnDestroy(): void {
    console.debug('Entering BattleCityComponent::ngOnDestroy');
    if (this.timerGame !== undefined) {
      clearInterval(this.timerGame);
    }
  }

  gameLoop() {
    // console.debug('Entering BattleCityComponent.gameLoop');

    switch (BattleCityGlobalContext.gameState) {
      case GAME_STATE_MENU:
        BattleCityGlobalContext.menu.draw();
        break;

      case GAME_STATE_INIT:
        BattleCityGlobalContext.stage!.draw();
        if (BattleCityGlobalContext.stage!.isReady === true) {
          BattleCityGlobalContext.gameState = GAME_STATE_START;
        }
        break;

      case GAME_STATE_START:
        BattleCityGlobalContext.drawAll();
        if(BattleCityGlobalContext.isGameOver ||(BattleCityGlobalContext.player1!.lives <=0 && BattleCityGlobalContext.player2!.lives <= 0)){
          BattleCityGlobalContext.gameState = GAME_STATE_OVER;
          BattleCityGlobalContext.map!.homeHit();
          // TBD
          // PLAYER_DESTROY_AUDIO.play();
        }
        if(BattleCityGlobalContext.appearEnemy == BattleCityGlobalContext.maxEnemy && BattleCityGlobalContext.enemyArray.length == 0){
          BattleCityGlobalContext.gameState  = GAME_STATE_WIN;
        }
        break;
      case GAME_STATE_WIN:
        BattleCityGlobalContext.nextLevel();
        break;
      case GAME_STATE_OVER:
        BattleCityGlobalContext.gameOver();
        break;
    }
  }
}
